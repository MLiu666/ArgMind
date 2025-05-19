from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import json
import os
from typing import List, Dict
from models.neuralcdm.neuralcdm import NeuralCDM

app = FastAPI()

# Load Q-matrix
with open('src/data/qmatrix.json', 'r') as f:
    q_matrix_data = json.load(f)

# Initialize model
model = NeuralCDM(
    num_skills=len(q_matrix_data['skills']),
    num_students=1000,  # Adjust based on your needs
    num_items=len(q_matrix_data['tasks'])
)

# Load saved model if exists
model_path = 'models/saved/neuralcdm_model.pt'
if os.path.exists(model_path):
    model = NeuralCDM.load_model(model_path)

class AttemptLog(BaseModel):
    user_id: int
    item_id: int
    correct: int

class MasteryResponse(BaseModel):
    skills: Dict[str, float]

@app.post("/log_attempt")
async def log_attempt(attempt: AttemptLog):
    """Log a learner's attempt at a task"""
    try:
        # Convert to tensors
        student_id = torch.tensor([attempt.user_id])
        item_id = torch.tensor([attempt.item_id])
        correct = torch.tensor([attempt.correct], dtype=torch.float)
        
        # Get Q-matrix for the item
        q_matrix = torch.tensor([q_matrix_data['tasks'][f"task_{attempt.item_id+1}"]])
        
        # Forward pass to update embeddings
        model.train()
        prediction = model(student_id, item_id, q_matrix)
        
        # Calculate loss and update model
        criterion = torch.nn.BCELoss()
        loss = criterion(prediction, correct)
        loss.backward()
        
        # Update model weights
        optimizer = torch.optim.Adam(model.parameters())
        optimizer.step()
        optimizer.zero_grad()
        
        # Save updated model
        model.save_model(model_path)
        
        return {"status": "success", "message": "Attempt logged successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_mastery/{user_id}", response_model=MasteryResponse)
async def get_mastery(user_id: int):
    """Get a user's mastery scores for all Toulmin skills"""
    try:
        # Get mastery scores
        mastery_scores = model.get_mastery(user_id)
        
        # Convert to dictionary with skill names
        mastery_dict = {
            skill_name: float(mastery_scores[int(skill_id)])
            for skill_id, skill_name in q_matrix_data['skills'].items()
        }
        
        return MasteryResponse(skills=mastery_dict)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 