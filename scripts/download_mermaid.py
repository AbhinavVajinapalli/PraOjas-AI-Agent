import base64
import json
import urllib.request
import os

mermaid_code = """flowchart TD
    %% Node Styling
    classDef user fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:#fff,rx:10,ry:10,font-weight:bold,font-size:14px;
    classDef coord fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff,font-weight:bold,font-size:15px;
    classDef agent fill:#f43f5e,stroke:#e11d48,stroke-width:2px,color:#fff,rx:8,ry:8;
    classDef llm fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff,rx:8,ry:8,stroke-dasharray: 5 5;
    classDef ui fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff,rx:12,ry:12;
    classDef memory fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef formatting fill:#64748b,stroke:#475569,stroke-width:2px,color:#fff,rx:5,ry:5;

    %% Nodes
    User([👤 USER REQUEST <br/> Patient Data & Vitals]):::user --> Coord{🧠 COORDINATOR <br/> AGENT}:::coord
    
    %% Document Parsing Flow
    Coord --> Doc[📄 DOCUMENT PARSING AGENT <br/> PDF/CSV/Text]:::agent
    Doc --> NLP[📝 Clinical NLP <br/> Entity Extract]:::agent
    
    %% Prediction Flow with Memory
    Coord --> Pred[⚡ PREDICTION AGENT <br/> Risk Scoring]:::agent
    Memory[(💾 MEMORY AGENT <br/> Past & Upcoming Data)]:::memory -.->|Historical Context| Pred
    Pred --> GemS[✨ Gemini LLM <br/> Sepsis / Mortality]:::llm
    
    %% Interaction convergence (Prediction feeds into Knowledge)
    GemS --> Know[📚 Medical Knowledge Agent <br/> Guidelines]:::agent
    NLP --> Know
    
    %% Final output
    Know --> Rep[📋 Clinical Report Agent <br/> Generate Insights]:::agent
    Rep --> Formatter[⚙️ RESPONSE FORMATTING <br/> JSON Response]:::formatting
    
    Formatter --> Dash([💻 FRONTEND DASHBOARD <br/> Visualization & Alerts]):::ui
"""

# Create state object with beautiful base theme
state = {
    "code": mermaid_code,
    "mermaid": {
        "theme": "base",
        "themeVariables": {
            "fontFamily": "Inter, Roboto, sans-serif",
            "primaryColor": "#ffffff",
            "edgeLabelBackground": "#ffffff",
            "tertiaryColor": "#f8fafc",
            "lineColor": "#cbd5e1"
        }
    }
}

# Encode state to base64
json_str = json.dumps(state)
b64 = base64.urlsafe_b64encode(json_str.encode('utf-8')).decode('utf-8').rstrip("=")

url = f"https://mermaid.ink/img/{b64}"

print(f"Downloading from: {url}")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    os.makedirs('assets', exist_ok=True)
    with open('assets/workflow.png', 'wb') as f:
        f.write(response.read())

print("Successfully saved to assets/workflow.png")
