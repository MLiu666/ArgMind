import torch
import torch.nn as nn
import torch.nn.functional as F
import json
import os

class NeuralCDM(nn.Module):
    def __init__(self, num_skills, num_students, num_items, hidden_dim=64):
        super(NeuralCDM, self).__init__()
        self.num_skills = num_skills
        self.num_students = num_students
        self.num_items = num_items
        
        # Student ability embeddings
        self.student_embeddings = nn.Embedding(num_students, num_skills)
        
        # Item difficulty embeddings
        self.item_embeddings = nn.Embedding(num_items, num_skills)
        
        # Neural network layers
        self.fc1 = nn.Linear(num_skills * 2, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, 1)
        
        # Initialize weights
        self._init_weights()
    
    def _init_weights(self):
        nn.init.xavier_uniform_(self.student_embeddings.weight)
        nn.init.xavier_uniform_(self.item_embeddings.weight)
        nn.init.xavier_uniform_(self.fc1.weight)
        nn.init.xavier_uniform_(self.fc2.weight)
    
    def forward(self, student_ids, item_ids, q_matrix):
        # Get student abilities and item difficulties
        student_abilities = self.student_embeddings(student_ids)  # [batch_size, num_skills]
        item_difficulties = self.item_embeddings(item_ids)  # [batch_size, num_skills]
        
        # Apply Q-matrix masking
        masked_abilities = student_abilities * q_matrix
        masked_difficulties = item_difficulties * q_matrix
        
        # Concatenate masked abilities and difficulties
        combined = torch.cat([masked_abilities, masked_difficulties], dim=1)
        
        # Pass through neural network
        x = F.relu(self.fc1(combined))
        x = torch.sigmoid(self.fc2(x))
        
        return x.squeeze(-1)
    
    def get_mastery(self, student_id):
        """Get mastery scores for all skills for a given student"""
        with torch.no_grad():
            abilities = self.student_embeddings(torch.tensor([student_id]))
            return torch.sigmoid(abilities).squeeze().numpy()
    
    def save_model(self, path):
        """Save model state and configuration"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save({
            'model_state_dict': self.state_dict(),
            'num_skills': self.num_skills,
            'num_students': self.num_students,
            'num_items': self.num_items
        }, path)
    
    @classmethod
    def load_model(cls, path):
        """Load model from saved state"""
        checkpoint = torch.load(path)
        model = cls(
            num_skills=checkpoint['num_skills'],
            num_students=checkpoint['num_students'],
            num_items=checkpoint['num_items']
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        return model 