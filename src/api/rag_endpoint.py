from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..models.mab_enhanced_rag import MABEnhancedRAG

router = APIRouter()
mab_rag = MABEnhancedRAG()

class QueryRequest(BaseModel):
    query: str
    component_type: Optional[str] = None

class QueryResponse(BaseModel):
    results: List[Dict[str, Any]]
    selected_arm: int
    arm_statistics: Dict[str, Any]

@router.post("/retrieve", response_model=QueryResponse)
async def retrieve_essays(request: QueryRequest):
    """
    Retrieve relevant essays using MAB-enhanced RAG.
    
    Args:
        request: QueryRequest containing the search query and optional component type
        
    Returns:
        QueryResponse containing the retrieved essays and MAB statistics
    """
    try:
        results, selected_arm = mab_rag.retrieve(request.query)
        arm_stats = mab_rag.get_arm_statistics()
        
        return QueryResponse(
            results=results,
            selected_arm=selected_arm,
            arm_statistics=arm_stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics")
async def get_statistics():
    """Get current MAB statistics."""
    try:
        return mab_rag.get_arm_statistics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 