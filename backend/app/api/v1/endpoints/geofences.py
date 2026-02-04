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
    db_geofence = Geofence.model_validate(geofence)
    session.add(db_geofence)
    session.commit()
    session.refresh(db_geofence)

    # Also register in Tile38 if active
    if db_geofence.mode == GeofenceMode.ACTIVE:
        await tile38.set_geofence(
            fence_id=db_geofence.uid,
            shape_type=db_geofence.shape_type,
            shape_data=json.loads(db_geofence.shape_data),
        )

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

    # Update Tile38
    if db_geofence.mode == GeofenceMode.ACTIVE:
        await tile38.set_geofence(
            fence_id=db_geofence.uid,
            shape_type=db_geofence.shape_type,
            shape_data=json.loads(db_geofence.shape_data),
        )
    elif db_geofence.mode in [GeofenceMode.INACTIVE, GeofenceMode.ARCHIVE]:
        # Implementation for removing from Tile38 monitoring if needed
        pass

    return db_geofence
