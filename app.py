"""Scholarship Application Assistant Flask Application.

Provides a responsive web interface for:
1. Scholarship eligibility verification and award recommendation.
2. Document-grounded RAG question-answering.
3. RESTful API endpoints matching specifications.
"""

import os
from flask import Flask, render_template, request, jsonify, redirect, url_for
from scholarship_tool import check_scholarship_options
from rag_service import ask_question

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "scholarship-assistant-dev-key")

DISCLAIMER_TEXT = (
    "Eligibility does not guarantee selection or payment. "
    "The scholarship committee makes the final award decision."
)


@app.route("/", methods=["GET", "POST"])
def index():
    """Main scholarship eligibility checker page."""
    form_data = {
        "academic_percentage": "",
        "attendance_percentage": "",
        "annual_family_income": ""
    }
    error_message = None
    results = None

    if request.method == "POST":
        acad_str = request.form.get("academic_percentage", "").strip()
        att_str = request.form.get("attendance_percentage", "").strip()
        inc_str = request.form.get("annual_family_income", "").strip()

        form_data = {
            "academic_percentage": acad_str,
            "attendance_percentage": att_str,
            "annual_family_income": inc_str
        }

        try:
            results = check_scholarship_options(acad_str, att_str, inc_str)
        except ValueError as ex:
            error_message = str(ex)
        except Exception:
            error_message = "An unexpected server error occurred during eligibility evaluation. Please try again."

    return render_template(
        "index.html",
        form_data=form_data,
        error_message=error_message,
        results=results,
        disclaimer=DISCLAIMER_TEXT
    )


@app.route("/chat", methods=["GET", "POST"])
def chat():
    """RAG document-grounded question-answering page."""
    question = ""
    qa_result = None
    error_message = None

    demo_questions = [
        "Which scholarship needs an income certificate?",
        "Can both scholarships be awarded together?",
        "When will money reach my bank account?"
    ]

    if request.method == "POST":
        question = request.form.get("question", "").strip()
        if not question:
            error_message = "Please enter a question to ask."
        else:
            try:
                qa_result = ask_question(question)
            except ValueError as ex:
                error_message = str(ex)
            except Exception:
                error_message = "Document question-answering service is temporarily unavailable. Please try again."

    return render_template(
        "chat.html",
        question=question,
        qa_result=qa_result,
        error_message=error_message,
        demo_questions=demo_questions,
        disclaimer=DISCLAIMER_TEXT
    )


# --- RESTful API Endpoints ---

@app.route("/api/check-scholarships", methods=["POST"])
def api_check_scholarships():
    """REST API endpoint for scholarship eligibility check."""
    if not request.is_json:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    data = request.get_json() or {}
    acad = data.get("academic_percentage")
    att = data.get("attendance_percentage")
    inc = data.get("annual_family_income")

    try:
        results = check_scholarship_options(acad, att, inc)
        return jsonify(results), 200
    except ValueError as ex:
        return jsonify({"error": str(ex)}), 400
    except Exception as ex:
        return jsonify({"error": "Eligibility service error."}), 500


@app.route("/api/ask", methods=["POST"])
def api_ask():
    """REST API endpoint for RAG question-answering."""
    if not request.is_json:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    data = request.get_json() or {}
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Question field is required and cannot be empty."}), 400

    try:
        res = ask_question(question)
        return jsonify({
            "answer": res["answer"],
            "sources": res["sources"]
        }), 200
    except ValueError as ex:
        return jsonify({"error": str(ex)}), 400
    except Exception:
        return jsonify({"error": "Question-answering service encountered an error."}), 500


# --- Error Handlers ---

@app.errorhandler(400)
def bad_request(e):
    return render_template("error.html", code=400, message="Bad Request: The submitted input was invalid."), 400


@app.errorhandler(404)
def page_not_found(e):
    return render_template("error.html", code=404, message="Page Not Found: The requested URL was not found."), 404


@app.errorhandler(500)
def server_error(e):
    return render_template("error.html", code=500, message="Internal Server Error: Please try again later."), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
