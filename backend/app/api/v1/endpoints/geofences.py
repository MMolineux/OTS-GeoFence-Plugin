from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.engine import get_session
from app.models.geofence import Geofence, GeofenceCreate, GeofenceUpdate, GeofenceMode
from app.services.tile38 import Tile38Service, get_tile38
import json

router = APIRouter()


@router.post("/", response_model=Geofence)
async def create_geofence(
    *,
    session: Session = Depends(get_session),
    tile38: Tile38Service = Depends(get_tile38),
    geofence: GeofenceCreate,
):
    # Parse shape data to validate and extract coordinates for Tile38
    shape_data = json.loads(geofence.shape_data)

    # Simplified validation: Assume Circle or Point for now
    if geofence.shape_type == "circle":
        lat = shape_data.get("lat")
        lon = shape_data.get("lon")
        radius = shape_data.get("radius")
        if not all([lat, lon, radius]):
            raise HTTPException(status_code=400, detail="Invalid circle shape data")
    else:
        # For now, only Circles are supported in the Tile38 Hook implementation
        raise HTTPException(
            status_code=400, detail="Currently only 'circle' shape_type is supported"
        )

    # TODO: make this operation atomic
    # from hhere
    db_geofence = Geofence.model_validate(geofence)
    session.add(db_geofence)
    session.commit()
    session.refresh(db_geofence)

    # Register hook in Tile38
    await tile38.create_hook(
        geofence_id=db_geofence.id,
        geofence_name=db_geofence.name,
        lat=lat,
        lon=lon,
        radius_meters=radius,
    )
    # To here
    # distributed atomic transactions are hard..
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

    # Handle mode changes (Active <-> Report-Only)
    old_mode = db_geofence.mode
    new_mode = geofence_update.mode if geofence_update.mode else old_mode

    obj_data = geofence_update.model_dump(exclude_unset=True)
    for key, value in obj_data.items():
        setattr(db_geofence, key, value)

    session.add(db_geofence)
    session.commit()
    session.refresh(db_geofence)

    # TODO: Logic for Tile38 Hook updates would go here
    # For now, we assume hooks are immutable and deleted/recreated if shape changes

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

    # Delete from Tile38 first
    await tile38.delete_hook(db_geofence.id)

    # Delete from DB
    session.delete(db_geofence)
    session.commit()

    return {"status": "deleted"}
