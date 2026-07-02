import logging
from backend.models.transformer_service import model_service
from backend.agents.explainability import ExplainabilityAgent
from backend.agents.document_parser import DocumentParserAgent
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CoordinatorAgent:
    """
    Orchestrates the workflow between the user inputs, pre-trained Transformer model, and explainability agents.
    """
    def __init__(self):
        self.explainability_agent = ExplainabilityAgent()
        self.document_parser = DocumentParserAgent()
        
    def process_prediction_request(self, patient_data: dict) -> dict:
        logger.info("Coordinator processing prediction request")
        
        # 1. Preprocess data for Transformer
        processed_tensors = model_service.preprocess(
            raw_vitals=patient_data.get("vitals", {}),
            raw_labs=patient_data.get("labs", {}),
            clinical_notes=patient_data.get("clinical_notes", "")
        )
        
        # 2. Transformer Inference
        prediction = model_service.predict(processed_tensors)
        
        # 3. Generate Explainability & Recommendations
        explanation_data = self.explainability_agent.generate_explanation(patient_data, prediction)
        
        # 4. Merge results
        result = {
            "sepsis_probability": prediction["sepsis_probability"],
            "mortality_probability": prediction["mortality_probability"],
            "confidence_score": prediction["confidence_score"],
            "explainability": explanation_data.get("explanation", ""),
            "feature_importance": explanation_data.get("feature_importance", []),
            "recommendations": explanation_data.get("recommendations", [])
        }
        
        return result

    def process_uploaded_document(self, text: str) -> dict:
        return self.document_parser.parse_document(text)

coordinator = CoordinatorAgent()
