"""Unit tests for rag_service.py."""

import unittest
from rag_service import ask_question, load_knowledge_documents


class TestRagService(unittest.TestCase):

    def test_knowledge_documents_loaded(self):
        """Ensure all 3 authoritative knowledge documents are present and non-empty."""
        docs = load_knowledge_documents()
        self.assertIn("scholarship_catalogue.txt", docs)
        self.assertIn("scholarship_eligibility.txt", docs)
        self.assertIn("scholarship_application.txt", docs)
        for name, content in docs.items():
            self.assertTrue(len(content) > 0, f"{name} is empty")

    def test_demo_question_1_income_certificate(self):
        """Demo Q1: Which scholarship needs an income certificate?"""
        res = ask_question("Which scholarship needs an income certificate?")
        self.assertIn("Access Scholarship", res["answer"])
        self.assertIn("income certificate", res["answer"].lower())
        self.assertIn("scholarship_application.txt", res["sources"])

    def test_demo_question_2_both_scholarships(self):
        """Demo Q2: Can both scholarships be awarded together?"""
        res = ask_question("Can both scholarships be awarded together?")
        self.assertIn("only one scholarship may be awarded", res["answer"].lower())
        self.assertIn("higher award", res["answer"].lower())
        self.assertIn("scholarship_eligibility.txt", res["sources"])

    def test_demo_question_3_bank_payment_out_of_scope(self):
        """Demo Q3: When will money reach my bank account? (Out of scope)."""
        res = ask_question("When will money reach my bank account?")
        # Must not invent dates
        self.assertIn("do not specify payment dates", res["answer"].lower())
        self.assertIn("scholarship committee", res["answer"].lower())
        self.assertNotIn("2025", res["answer"])
        self.assertNotIn("days", res["answer"])

    def test_empty_question_rejected(self):
        """Reject empty or whitespace query."""
        with self.assertRaises(ValueError):
            ask_question("")
        with self.assertRaises(ValueError):
            ask_question("   ")


if __name__ == "__main__":
    unittest.main()
