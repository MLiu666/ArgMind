import json
from typing import List, Dict, Any
from pathlib import Path

class KnowledgeGraphRAG:
    def __init__(self, knowledge_graph_path: str = "src/data/ielts_knowledge_graph.json"):
        self.knowledge_graph_path = Path(knowledge_graph_path)
        self.knowledge_graph = self._load_knowledge_graph()
        
    def _load_knowledge_graph(self) -> Dict[str, Any]:
        """Load the knowledge graph from JSON file."""
        with open(self.knowledge_graph_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def get_relevant_essays(self, query: str, component_type: str = None) -> List[Dict[str, Any]]:
        """
        Retrieve relevant essays based on the query and optional component type.
        
        Args:
            query: The search query
            component_type: Optional filter for specific argument components (claim, data, warrant, etc.)
            
        Returns:
            List of relevant essays with their components
        """
        relevant_essays = []
        
        for essay in self.knowledge_graph['essays']:
            # Check if component type is specified
            if component_type:
                if component_type in essay['components']:
                    component = essay['components'][component_type]
                    if isinstance(component, list):
                        # For data points, check each item
                        if any(query.lower() in item.lower() for item in component):
                            relevant_essays.append(essay)
                    else:
                        # For single components like claim, warrant, etc.
                        if query.lower() in component.lower():
                            relevant_essays.append(essay)
            else:
                # Search across all components
                for component in essay['components'].values():
                    if isinstance(component, list):
                        if any(query.lower() in item.lower() for item in component):
                            relevant_essays.append(essay)
                            break
                    else:
                        if query.lower() in component.lower():
                            relevant_essays.append(essay)
                            break
        
        return relevant_essays
    
    def get_component_examples(self, component_type: str) -> List[Dict[str, Any]]:
        """
        Get examples of specific argument components from high-scoring essays.
        
        Args:
            component_type: The type of component to retrieve (claim, data, warrant, etc.)
            
        Returns:
            List of examples for the specified component type
        """
        examples = []
        
        for essay in self.knowledge_graph['essays']:
            if essay['band_score'] >= 7 and component_type in essay['components']:
                component = essay['components'][component_type]
                examples.append({
                    'example': component,
                    'topic': essay['topic'],
                    'band_score': essay['band_score']
                })
        
        return examples
    
    def get_essay_structure(self, topic: str) -> Dict[str, Any]:
        """
        Get the structure of a high-scoring essay for a given topic.
        
        Args:
            topic: The essay topic to search for
            
        Returns:
            Dictionary containing the essay structure and components
        """
        for essay in self.knowledge_graph['essays']:
            if topic.lower() in essay['topic'].lower() and essay['band_score'] >= 7:
                return {
                    'topic': essay['topic'],
                    'components': essay['components'],
                    'band_score': essay['band_score']
                }
        return None 