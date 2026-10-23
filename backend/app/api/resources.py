from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.core.database import get_db
from app.models.resource import Resource
from app.schemas import ResourceOut

router = APIRouter(prefix="/resources", tags=["Self-Help Resources"])

@router.get("", response_model=List[ResourceOut])
def list_resources(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term for title or content"),
    db: Session = Depends(get_db)
):
    query = db.query(Resource)
    if category and category.lower() != "all":
        query = query.filter(Resource.category.ilike(f"%{category}%"))
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Resource.title.ilike(search_filter),
                Resource.short_description.ilike(search_filter),
                Resource.content.ilike(search_filter)
            )
        )
    return query.order_by(Resource.views_count.desc(), Resource.id.asc()).all()

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Resource.category).distinct().all()
    return {"categories": [c[0] for c in categories if c[0]]}

@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource_detail(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")
    
    # Increment view count
    resource.views_count += 1
    db.commit()
    db.refresh(resource)
    return resource
