import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import json
import os
from neuralcdm import NeuralCDM

def generate_dummy_data(num_students, num_items, num_skills, q_matrix, num_samples=1000):
    """Generate dummy training data"""
    student_ids = np.random.randint(0, num_students, num_samples)
    item_ids = np.random.randint(0, num_items, num_samples)
    
    # Generate random correct/incorrect responses
    correct = np.random.randint(0, 2, num_samples)
    
    # Convert to PyTorch tensors
    student_ids = torch.LongTensor(student_ids)
    item_ids = torch.LongTensor(item_ids)
    correct = torch.FloatTensor(correct)
    
    # Get Q-matrix for each item
    q_matrix_tensor = torch.FloatTensor([q_matrix[f"task_{i+1}"] for i in item_ids])
    
    return student_ids, item_ids, q_matrix_tensor, correct

def train_model(model, train_data, num_epochs=100, learning_rate=0.001):
    """Train the NeuralCDM model"""
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    student_ids, item_ids, q_matrix, correct = train_data
    
    for epoch in range(num_epochs):
        model.train()
        optimizer.zero_grad()
        
        # Forward pass
        predictions = model(student_ids, item_ids, q_matrix)
        
        # Calculate loss
        loss = criterion(predictions, correct)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 10 == 0:
            print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

def main():
    # Load Q-matrix
    with open('src/data/qmatrix.json', 'r') as f:
        q_matrix_data = json.load(f)
    
    num_skills = len(q_matrix_data['skills'])
    num_students = 100  # Dummy number of students
    num_items = len(q_matrix_data['tasks'])
    q_matrix = q_matrix_data['tasks']
    
    # Initialize model
    model = NeuralCDM(num_skills, num_students, num_items)
    
    # Generate dummy data
    train_data = generate_dummy_data(num_students, num_items, num_skills, q_matrix)
    
    # Train model
    train_model(model, train_data)
    
    # Save model
    os.makedirs('models/saved', exist_ok=True)
    model.save_model('models/saved/neuralcdm_model.pt')
    
    # Test model on a sample student
    student_id = 0
    mastery_scores = model.get_mastery(student_id)
    print("\nSample student mastery scores:")
    for skill_id, skill_name in q_matrix_data['skills'].items():
        print(f"{skill_name}: {mastery_scores[int(skill_id)]:.3f}")

if __name__ == "__main__":
    main() 