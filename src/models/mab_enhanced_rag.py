import numpy as np
from typing import List, Dict, Any, Tuple
from .knowledge_graph_rag import KnowledgeGraphRAG

class MABEnhancedRAG:
    def __init__(self, knowledge_graph_path: str = "src/data/ielts_knowledge_graph.json"):
        self.knowledge_graph_rag = KnowledgeGraphRAG(knowledge_graph_path)
        self.num_arms = 3  # Number of retrieval methods
        self.arm_values = np.zeros(self.num_arms)  # Estimated values for each arm
        self.arm_counts = np.zeros(self.num_arms)  # Number of times each arm was pulled
        self.alpha = 0.1  # Learning rate
        self.epsilon = 0.1  # Exploration rate
        
    def _extract_features(self, query: str) -> np.ndarray:
        """Extract features from the query for routing."""
        # Simple feature extraction based on query length and component keywords
        features = np.zeros(5)  # 5 basic features
        features[0] = len(query) / 100  # Normalized query length
        features[1] = 1.0 if 'claim' in query.lower() else 0.0
        features[2] = 1.0 if 'data' in query.lower() else 0.0
        features[3] = 1.0 if 'warrant' in query.lower() else 0.0
        features[4] = 1.0 if 'rebuttal' in query.lower() else 0.0
        return features

    def _select_arm(self, features: np.ndarray) -> int:
        """Select an arm using epsilon-greedy strategy."""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.num_arms)
        return np.argmax(self.arm_values)

    def _get_reward(self, selected_arm: int, results: List[Dict[str, Any]]) -> float:
        """Calculate reward based on retrieval results."""
        if not results:
            return 0.0
        
        # Reward based on number of relevant results and their band scores
        reward = 0.0
        for result in results:
            reward += result.get('band_score', 0) / 9.0  # Normalize by max band score
        
        return reward / len(results)

    def _update_arm_value(self, arm: int, reward: float):
        """Update the estimated value of the selected arm."""
        self.arm_counts[arm] += 1
        self.arm_values[arm] += self.alpha * (reward - self.arm_values[arm])

    def retrieve(self, query: str) -> Tuple[List[Dict[str, Any]], int]:
        """
        Retrieve relevant essays using MAB-enhanced RAG.
        
        Args:
            query: The search query
            
        Returns:
            Tuple of (retrieved essays, selected arm index)
        """
        features = self._extract_features(query)
        selected_arm = self._select_arm(features)
        
        # Different retrieval methods based on selected arm
        if selected_arm == 0:
            # Method 1: Direct component search
            results = self.knowledge_graph_rag.get_relevant_essays(query)
        elif selected_arm == 1:
            # Method 2: Structure-based search
            results = self.knowledge_graph_rag.get_essay_structure(query)
            results = [results] if results else []
        else:
            # Method 3: Example-based search
            component_type = next((c for c in ['claim', 'data', 'warrant'] 
                                 if c in query.lower()), None)
            results = self.knowledge_graph_rag.get_component_examples(component_type) if component_type else []
        
        # Calculate reward and update arm value
        reward = self._get_reward(selected_arm, results)
        self._update_arm_value(selected_arm, reward)
        
        return results, selected_arm

    def get_arm_statistics(self) -> Dict[str, Any]:
        """Get statistics about the performance of each arm."""
        return {
            'arm_values': self.arm_values.tolist(),
            'arm_counts': self.arm_counts.tolist(),
            'best_arm': int(np.argmax(self.arm_values))
        } 