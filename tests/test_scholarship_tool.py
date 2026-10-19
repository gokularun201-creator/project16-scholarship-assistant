"""Unit tests for scholarship_tool.py business logic."""

import unittest
from scholarship_tool import check_scholarship_options


class TestScholarshipTool(unittest.TestCase):

    def test_acceptance_case_1_both_match(self):
        """Test Case 1: Academic 90, Attendance 95, Income 200000 -> Both; recommend Merit."""
        result = check_scholarship_options(90, 95, 200000)
        self.assertEqual(len(result["eligible_scholarships"]), 2)
        names = [s["name"] for s in result["eligible_scholarships"]]
        self.assertIn("Merit Scholarship", names)
        self.assertIn("Access Scholarship", names)
        self.assertEqual(result["recommended_scholarship"], "Merit Scholarship")
        self.assertEqual(result["recommended_award"], 15000)

    def test_acceptance_case_2_access_only(self):
        """Test Case 2: Academic 70, Attendance 80, Income 200000 -> Access only."""
        result = check_scholarship_options(70, 80, 200000)
        self.assertEqual(len(result["eligible_scholarships"]), 1)
        self.assertEqual(result["eligible_scholarships"][0]["name"], "Access Scholarship")
        self.assertEqual(result["eligible_scholarships"][0]["award"], 10000)
        self.assertEqual(result["recommended_scholarship"], "Access Scholarship")
        self.assertEqual(result["recommended_award"], 10000)

    def test_acceptance_case_3_no_match(self):
        """Test Case 3: Academic 90, Attendance 70, Income 100000 -> No match."""
        result = check_scholarship_options(90, 70, 100000)
        self.assertEqual(result["eligible_scholarships"], [])
        self.assertIsNone(result["recommended_scholarship"])
        self.assertIsNone(result["recommended_award"])

    def test_boundary_merit_high_income(self):
        """Boundary: Acad 85, Att 90, Income 300000 -> Merit only (no income cap on Merit)."""
        result = check_scholarship_options(85, 90, 300000)
        self.assertEqual(len(result["eligible_scholarships"]), 1)
        self.assertEqual(result["recommended_scholarship"], "Merit Scholarship")
        self.assertEqual(result["recommended_award"], 15000)

    def test_boundary_access_exact_limits(self):
        """Boundary: Acad 60, Att 75, Income 250000 -> Access only (exact inclusive thresholds)."""
        result = check_scholarship_options(60, 75, 250000)
        self.assertEqual(len(result["eligible_scholarships"]), 1)
        self.assertEqual(result["recommended_scholarship"], "Access Scholarship")
        self.assertEqual(result["recommended_award"], 10000)

    def test_boundary_academic_just_below_merit(self):
        """Boundary: Acad 84.99, Att 90, Income 200000 -> Access only."""
        result = check_scholarship_options(84.99, 90, 200000)
        self.assertEqual(len(result["eligible_scholarships"]), 1)
        self.assertEqual(result["recommended_scholarship"], "Access Scholarship")
        self.assertEqual(result["recommended_award"], 10000)

    def test_boundary_attendance_just_below_merit(self):
        """Boundary: Acad 90, Att 89.99, Income 200000 -> Access only."""
        result = check_scholarship_options(90, 89.99, 200000)
        self.assertEqual(len(result["eligible_scholarships"]), 1)
        self.assertEqual(result["recommended_scholarship"], "Access Scholarship")
        self.assertEqual(result["recommended_award"], 10000)

    def test_boundary_income_just_above_access(self):
        """Boundary: Acad 90, Att 95, Income 250001 -> Merit only."""
        result = check_scholarship_options(90, 95, 250001)
        self.assertEqual(len(result["eligible_scholarships"]), 1)
        self.assertEqual(result["recommended_scholarship"], "Merit Scholarship")
        self.assertEqual(result["recommended_award"], 15000)

    def test_boundary_zero_income(self):
        """Boundary: Acad 90, Att 95, Income 0 -> Both; recommend Merit."""
        result = check_scholarship_options(90, 95, 0)
        self.assertEqual(len(result["eligible_scholarships"]), 2)
        self.assertEqual(result["recommended_scholarship"], "Merit Scholarship")
        self.assertEqual(result["recommended_award"], 15000)

    def test_boundary_academic_just_below_access(self):
        """Boundary: Acad 59.99, Att 95, Income 200000 -> No match."""
        result = check_scholarship_options(59.99, 95, 200000)
        self.assertEqual(result["eligible_scholarships"], [])
        self.assertIsNone(result["recommended_scholarship"])
        self.assertIsNone(result["recommended_award"])

    def test_boundary_attendance_just_below_access(self):
        """Boundary: Acad 90, Att 70, Income 250000 -> No match."""
        result = check_scholarship_options(90, 70, 250000)
        self.assertEqual(result["eligible_scholarships"], [])
        self.assertIsNone(result["recommended_scholarship"])

    def test_awards_are_never_added(self):
        """Verify that award amounts are never summed together."""
        result = check_scholarship_options(90, 95, 200000)
        self.assertNotEqual(result["recommended_award"], 25000)
        self.assertEqual(result["recommended_award"], 15000)


if __name__ == "__main__":
    unittest.main()
