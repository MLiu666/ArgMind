from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..models.mab_enhanced_rag import MABEnhancedRAG

router = APIRouter()
mab_rag = MABEnhancedRAG()

class StudentResponse(BaseModel):
    studentId: str
    name: str
    essays: List[Dict[str, Any]]
    statistics: Dict[str, Any]

@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student_profile(student_id: str):
    """
    Get student profile with their essay history and statistics.
    
    Args:
        student_id: The ID of the student
        
    Returns:
        StudentResponse containing student profile data
    """
    try:
        # Generate mock progress data
        start_date = datetime.now() - timedelta(days=30)
        progress_data = [
            {
                "date": (start_date + timedelta(days=i)).strftime("%Y-%m-%d"),
                "score": 6.5 + (i * 0.1)  # Simulated progress
            }
            for i in range(31)
        ]

        # Mock student data with enhanced features
        student_data = {
            "studentId": student_id,
            "name": f"Student {student_id}",
            "essays": [
                {
                    "id": "essay_1",
                    "topic": "Parents vs School Teaching Children",
                    "bandScore": 8.0,
                    "date": "2024-03-15",
                    "components": {
                        "claim": "Family upbringing plays a more important role in educating children",
                        "data": [
                            "Schools have standardized educational methods",
                            "Average class size in Vietnam is 20 students"
                        ],
                        "warrant": "One-to-one lessons at home allow children to progress faster",
                        "backing": "Example of bedtime stories instilling compassion",
                        "rebuttal": "Schools can foster cognitive development",
                        "qualifier": "School success stories represent only a small fraction"
                    }
                },
                {
                    "id": "essay_2",
                    "topic": "Technology in Education",
                    "bandScore": 7.5,
                    "date": "2024-03-10",
                    "components": {
                        "claim": "Technology enhances learning outcomes when properly integrated",
                        "data": [
                            "Interactive learning platforms increase engagement",
                            "Digital tools provide immediate feedback"
                        ],
                        "warrant": "Technology enables personalized learning experiences",
                        "backing": "Studies show 30% improvement in retention rates",
                        "rebuttal": "Over-reliance on technology may reduce critical thinking",
                        "qualifier": "Technology should complement, not replace, traditional methods"
                    }
                }
            ],
            "statistics": {
                "averageBandScore": 7.75,
                "strongestComponent": "Claim",
                "weakestComponent": "Rebuttal",
                "totalEssays": 5,
                "componentScores": {
                    "claim": 8.5,
                    "data": 7.8,
                    "warrant": 7.5,
                    "backing": 7.2,
                    "rebuttal": 6.8,
                    "qualifier": 7.0
                },
                "progressData": progress_data,
                "writingStyle": {
                    "vocabularyLevel": "Advanced",
                    "sentenceComplexity": "High",
                    "coherenceScore": 8.2,
                    "commonPatterns": [
                        "Clear topic sentences",
                        "Effective transitions",
                        "Strong supporting evidence",
                        "Balanced arguments"
                    ]
                },
                "recommendations": [
                    {
                        "component": "Rebuttal",
                        "suggestion": "Strengthen counter-arguments by providing more specific examples and evidence",
                        "priority": "high"
                    },
                    {
                        "component": "Backing",
                        "suggestion": "Include more academic sources and research to support your arguments",
                        "priority": "medium"
                    },
                    {
                        "component": "Qualifier",
                        "suggestion": "Add more nuanced qualifiers to make your arguments more balanced",
                        "priority": "low"
                    }
                ]
            }
        }
        
        return StudentResponse(**student_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 