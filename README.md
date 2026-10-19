# Project 16: Scholarship Application Assistant 🎓

A complete, educational web application built with **Python**, **Flask**, and **RAG (Retrieval-Augmented Generation)** to evaluate student scholarship eligibility and answer institutional policy questions using authoritative knowledge documents.

> [!NOTE]
> **Educational Demonstration**: This application uses fictional scholarship rules for classroom and demonstration purposes. It does not process actual scholarship payments, collect personal documents, or make official institutional award decisions.

---

## 📋 Table of Contents
- [Project Objectives](#-project-objectives)
- [Scholarship Rules & Business Logic](#-scholarship-rules--business-logic)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [RAG Demonstration Questions](#-rag-demonstration-questions)
- [Running Automated Tests](#-running-automated-tests)
- [Privacy & Scope Boundaries](#-privacy--scope-boundaries)

---

## 🎯 Project Objectives

1. Allow students to input **academic percentage**, **attendance percentage**, and **annual family income (INR)**.
2. Independently evaluate eligibility for **Merit Scholarship** and **Access Scholarship**.
3. Recommend the eligible scholarship offering the **highest award amount** (never combining award sums).
4. Provide a document-grounded **RAG Question-Answering** interface using three authoritative text documents.
5. Provide standard REST API endpoints for external client integrations.

---

## 📜 Scholarship Rules & Business Logic

### 1. Merit Scholarship
- **Award**: ₹15,000 (INR 15000)
- **Academic Score**: &ge; 85%
- **Attendance Rate**: &ge; 90%
- **Income Limit**: None specified (open to all income brackets)

### 2. Access Scholarship
- **Award**: ₹10,000 (INR 10000)
- **Academic Score**: &ge; 60%
- **Attendance Rate**: &ge; 75%
- **Annual Family Income**: &le; ₹2,50,000 (INR 250000)

### 3. Recommendation & Selection Policy
- Both scholarships are evaluated independently.
- If both match, both are returned in `eligible_scholarships`, and the **Merit Scholarship** (₹15,000) is recommended.
- Awards are never added together.
- Institutional disclaimer: *"Eligibility does not guarantee selection or payment. The scholarship committee makes the final award decision."*

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11+ / Flask 3.1+
- **Frontend**: HTML5, Modern Accessible CSS3, Vanilla JavaScript, Jinja2 Templates
- **RAG & Knowledge Processing**: Document-grounded retrieval over `knowledge/*.txt` with offline fallback mode and optional OpenAI/LlamaIndex integration.
- **Testing**: `pytest` and Python standard `unittest`.

---

## 📂 Project Directory Structure

```text
project16_scholarship_assistant/
├── app.py                      # Flask web application & REST routes
├── scholarship_tool.py         # Deterministic business logic & validation
├── rag_service.py              # Document-grounded RAG retrieval service
├── requirements.txt            # Dependency specification
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # Complete documentation
├── knowledge/                  # Authoritative knowledge base
│   ├── scholarship_catalogue.txt
│   ├── scholarship_eligibility.txt
│   └── scholarship_application.txt
├── templates/                  # Jinja2 HTML templates
│   ├── base.html
│   ├── index.html
│   ├── chat.html
│   └── error.html
├── static/                     # Static styling and client scripts
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── tests/                      # Automated test suite
    ├── test_scholarship_tool.py
    ├── test_validation.py
    ├── test_rag_service.py
    └── test_routes.py
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Python 3.11 or higher installed on your system.

### 2. Virtual Environment Setup

**Windows PowerShell**:
```powershell
cd project16_scholarship_assistant
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**:
```bash
cd project16_scholarship_assistant
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```powershell
python -m pip install -r requirements.txt
```

### 4. Configure Environment (Optional)
```powershell
cp .env.example .env
```
*(Leave `OPENAI_API_KEY` blank to run in 100% offline grounded mode).*

---

## 💻 Running the Application

Start the Flask development server:
```powershell
python app.py
```
Open your browser and navigate to:
**`http://127.0.0.1:5000`**

- **Eligibility Checker**: `http://127.0.0.1:5000/`
- **Knowledge Assistant (RAG)**: `http://127.0.0.1:5000/chat`

---

## 🔌 API Endpoints

### 1. Eligibility Check
- **Endpoint**: `POST /api/check-scholarships`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "academic_percentage": 90,
    "attendance_percentage": 95,
    "annual_family_income": 200000
  }
  ```
- **Response**:
  ```json
  {
    "eligible_scholarships": [
      { "name": "Merit Scholarship", "award": 15000 },
      { "name": "Access Scholarship", "award": 10000 }
    ],
    "recommended_scholarship": "Merit Scholarship",
    "recommended_award": 15000
  }
  ```

### 2. Document Q&A
- **Endpoint**: `POST /api/ask`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "question": "Which scholarship needs an income certificate?"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "The Access Scholarship requires an income certificate in addition to the academic record, attendance statement, and student identification.",
    "sources": ["scholarship_application.txt"]
  }
  ```

---

## 💡 RAG Demonstration Questions

The question-answering assistant at `/chat` provides 1-click test buttons for the 3 demonstration scenarios:

1. **Question**: *"Which scholarship needs an income certificate?"*
   - **Answer**: *"The Access Scholarship requires an income certificate in addition to the academic record, attendance statement, and student identification."*
   - **Source**: `scholarship_application.txt`

2. **Question**: *"Can both scholarships be awarded together?"*
   - **Answer**: *"A student may qualify for both scholarships, but only one scholarship may be awarded. When both scholarships match, the system recommends the one with the higher award amount."*
   - **Source**: `scholarship_eligibility.txt`

3. **Question**: *"When will money reach my bank account?"*
   - **Answer**: *"The supplied knowledge documents do not specify payment dates or bank transfer timelines. Recommend contacting the scholarship committee for official information."*
   - **Source**: None (Out of scope).

---

## 🧪 Running Automated Tests

Run the complete test suite via `pytest`:
```powershell
python -m pytest
```

Or using Python's built-in `unittest` runner:
```powershell
python -m unittest discover tests
```

---

## 🔒 Privacy & Scope Boundaries

- **No Data Persistence**: Student percentages and income are evaluated in-memory and not stored in any database or file.
- **No Document Uploads**: Personal documents (Aadhaar, income certificates, marksheets) are strictly forbidden from being collected.
- **No Payment Processing**: The tool does not connect to bank accounts or process funds.
