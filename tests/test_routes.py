"""Unit and integration tests for Flask web routes and API endpoints."""

import unittest
import json
from app import app


class TestRoutes(unittest.TestCase):

    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_get_index(self):
        """GET / returns HTTP 200 and displays form fields."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Scholarship Application Assistant", response.data)
        self.assertIn(b"Find scholarships", response.data)
        self.assertIn(b"Academic Percentage", response.data)

    def test_post_index_both_eligible(self):
        """POST / with valid inputs returning both scholarships."""
        response = self.client.post("/", data={
            "academic_percentage": "90",
            "attendance_percentage": "95",
            "annual_family_income": "200000"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Merit Scholarship", response.data)
        self.assertIn(b"Access Scholarship", response.data)
        self.assertIn(b"15,000", response.data)
        self.assertIn(b"Recommended Scholarship", response.data)

    def test_post_index_access_only(self):
        """POST / with valid inputs returning Access Scholarship only."""
        response = self.client.post("/", data={
            "academic_percentage": "70",
            "attendance_percentage": "80",
            "annual_family_income": "200000"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Access Scholarship", response.data)
        self.assertIn(b"10,000", response.data)

    def test_post_index_no_match(self):
        """POST / with inputs that match no scholarship."""
        response = self.client.post("/", data={
            "academic_percentage": "90",
            "attendance_percentage": "70",
            "annual_family_income": "100000"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"No Matching Scholarships Found", response.data)

    def test_post_index_validation_error(self):
        """POST / with invalid input renders validation error gracefully without 500."""
        response = self.client.post("/", data={
            "academic_percentage": "150",
            "attendance_percentage": "90",
            "annual_family_income": "200000"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"cannot exceed 100", response.data)

    def test_get_chat(self):
        """GET /chat returns HTTP 200 and displays Q&A page."""
        response = self.client.get("/chat")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Scholarship Knowledge Assistant", response.data)
        self.assertIn(b"Which scholarship needs an income certificate?", response.data)

    def test_post_chat_question(self):
        """POST /chat with demonstration question returns grounded response."""
        response = self.client.post("/chat", data={
            "question": "Which scholarship needs an income certificate?"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Access Scholarship", response.data)
        self.assertIn(b"scholarship_application.txt", response.data)

    def test_api_check_scholarships_contract(self):
        """POST /api/check-scholarships returns proper JSON contract."""
        payload = {
            "academic_percentage": 90,
            "attendance_percentage": 95,
            "annual_family_income": 200000
        }
        response = self.client.post(
            "/api/check-scholarships",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data["eligible_scholarships"]), 2)
        self.assertEqual(data["recommended_scholarship"], "Merit Scholarship")
        self.assertEqual(data["recommended_award"], 15000)

    def test_api_check_scholarships_no_match(self):
        """POST /api/check-scholarships returns empty list and nulls when no match."""
        payload = {
            "academic_percentage": 90,
            "attendance_percentage": 70,
            "annual_family_income": 100000
        }
        response = self.client.post(
            "/api/check-scholarships",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["eligible_scholarships"], [])
        self.assertIsNone(data["recommended_scholarship"])
        self.assertIsNone(data["recommended_award"])

    def test_api_ask_contract(self):
        """POST /api/ask returns answer and sources array."""
        payload = {
            "question": "Which scholarship needs an income certificate?"
        }
        response = self.client.post(
            "/api/ask",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("answer", data)
        self.assertIn("sources", data)
        self.assertIn("scholarship_application.txt", data["sources"])


if __name__ == "__main__":
    unittest.main()
