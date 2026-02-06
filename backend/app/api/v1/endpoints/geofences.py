import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.engine import get_session
from app.models.geofence import (
    Geofence,
    GeofenceCreate,
    GeofenceUpdate,
    GeofenceMode,
    DetectionType,
)
from app.services.tile38 import Tile38Service, get_tile38
from app.core.socket import (
    emit_geofence_created,
    emit_geofence_updated,
    emit_geofence_deleted,
)
import json

router = APIRouter()


def parse_detect_on(detect_on_str: str) -> List[DetectionType]:
    try:
        return [DetectionType(x) for x in json.loads(detect_on_str)]
    except (json.JSONDecodeError, ValueError):
        return []


@router.post("/", response_model=Geofence)
async def create_geofence(
    *,
    session: Session = Depends(get_session),
    tile38: Tile38Service = Depends(get_tile38),
    geofence: GeofenceCreate,
):
    shape_data = json.loads(geofence.shape_data)

    if geofence.shape_type == "circle":
        lat = shape_data.get("lat")
        lon = shape_data.get("lon")
        radius = shape_data.get("radius")
        if not all([lat, lon, radius]):
            raise HTTPException(status_code=400, detail="Invalid circle shape data")
    else:
        raise HTTPException(
            status_code=400, detail="Currently only 'circle' shape_type is supported"
        )

    db_geofence = Geofence(
        name=geofence.name,
        uid=geofence.uid,
        description=geofence.description,
        mode=geofence.mode,
        detect_on=geofence.detect_on,
        shape_type=geofence.shape_type,
        shape_data=geofence.shape_data,
    )
    session.add(db_geofence)
    session.commit()
    session.refresh(db_geofence)

    detect_on_list = parse_detect_on(db_geofence.detect_on)
    await tile38.create_hook(
        geofence_id=db_geofence.id,
        geofence_name=db_geofence.name,
        lat=lat,
        lon=lon,
        radius_meters=radius,
        detect_on=detect_on_list if detect_on_list else None,
    )

    await emit_geofence_created(db_geofence.id, db_geofence.name)

    return db_geofence


@router.get("/", response_model=List[Geofence])
async def read_geofences(
    *, session: Session = Depends(get_session), offset: int = 0, limit: int = 100
):
    geofences = session.exec(select(Geofence).offset(offset).limit(limit)).all()
    return geofences


@router.get("/{geofence_id}", response_model=Geofence)
async def read_geofence(*, session: Session = Depends(get_session), geofence_id: int):
    geofence = session.get(Geofence, geofence_id)
    if not geofence:
        raise HTTPException(status_code=404, detail="Geofence not found")
    return geofence


@router.patch("/{geofence_id}", response_model=Geofence)
async def update_geofence(
    *,
    session: Session = Depends(get_session),
    tile38: Tile38Service = Depends(get_tile38),
    geofence_id: int,
    geofence_update: GeofenceUpdate,
):
    db_geofence = session.get(Geofence, geofence_id)
    if not db_geofence:
        raise HTTPException(status_code=404, detail="Geofence not found")

    obj_data = geofence_update.model_dump(exclude_unset=True)
    for key, value in obj_data.items():
        setattr(db_geofence, key, value)

    session.add(db_geofence)
    session.commit()
    session.refresh(db_geofence)

    await emit_geofence_updated(db_geofence.id, db_geofence.name)

    return db_geofence


@router.patch("/{geofence_id}/move")
async def move_geofence(
    *,
    session: Session = Depends(get_session),
    tile38: Tile38Service = Depends(get_tile38),
    geofence_id: int,
    lat: float,
    lon: float,
):
    db_geofence = session.get(Geofence, geofence_id)
    if not db_geofence:
        raise HTTPException(status_code=404, detail="Geofence not found")

    shape_data = json.loads(db_geofence.shape_data)
    shape_data["lat"] = lat
    shape_data["lon"] = lon
    new_shape_data = json.dumps(shape_data)

    await tile38.delete_hook(db_geofence.id)

    db_geofence.shape_data = new_shape_data
    db_geofence.updated_at = time.time()
    session.add(db_geofence)
    session.commit()
    session.refresh(db_geofence)

    detect_on_list = parse_detect_on(db_geofence.detect_on)
    await tile38.create_hook(
        geofence_id=db_geofence.id,
        geofence_name=db_geofence.name,
        lat=lat,
        lon=lon,
        radius_meters=shape_data["radius"],
        detect_on=detect_on_list if detect_on_list else None,
    )

    await emit_geofence_updated(db_geofence.id, db_geofence.name)

    return db_geofence


@router.delete("/{geofence_id}")
async def delete_geofence(
    *,
    session: Session = Depends(get_session),
    tile38: Tile38Service = Depends(get_tile38),
    geofence_id: int,
):
    db_geofence = session.get(Geofence, geofence_id)
    if not db_geofence:
        raise HTTPException(status_code=404, detail="Geofence not found")

    await tile38.delete_hook(db_geofence.id)

    session.delete(db_geofence)
    session.commit()

    await emit_geofence_deleted(geofence_id)

    return {"status": "deleted"}
