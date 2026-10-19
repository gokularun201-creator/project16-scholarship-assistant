"""Unit tests for input validation logic."""

import unittest
import math
from scholarship_tool import check_scholarship_options, validate_numeric_input


class TestValidation(unittest.TestCase):

    def test_academic_percentage_negative(self):
        """Reject academic percentage below 0."""
        with self.assertRaises(ValueError) as ctx:
            check_scholarship_options(-1, 90, 200000)
        self.assertIn("Academic percentage must be at least 0.0", str(ctx.exception))

    def test_academic_percentage_above_100(self):
        """Reject academic percentage above 100."""
        with self.assertRaises(ValueError) as ctx:
            check_scholarship_options(100.1, 90, 200000)
        self.assertIn("Academic percentage cannot exceed 100.0", str(ctx.exception))

    def test_attendance_percentage_negative(self):
        """Reject attendance percentage below 0."""
        with self.assertRaises(ValueError) as ctx:
            check_scholarship_options(85, -5, 200000)
        self.assertIn("Attendance percentage must be at least 0.0", str(ctx.exception))

    def test_attendance_percentage_above_100(self):
        """Reject attendance percentage above 100."""
        with self.assertRaises(ValueError) as ctx:
            check_scholarship_options(85, 105, 200000)
        self.assertIn("Attendance percentage cannot exceed 100.0", str(ctx.exception))

    def test_income_negative(self):
        """Reject negative family income."""
        with self.assertRaises(ValueError) as ctx:
            check_scholarship_options(85, 90, -100)
        self.assertIn("Annual family income must be at least 0.0", str(ctx.exception))

    def test_missing_or_none_values(self):
        """Reject None inputs."""
        with self.assertRaises(ValueError):
            check_scholarship_options(None, 90, 200000)
        with self.assertRaises(ValueError):
            check_scholarship_options(85, None, 200000)
        with self.assertRaises(ValueError):
            check_scholarship_options(85, 90, None)

    def test_empty_string(self):
        """Reject empty strings."""
        with self.assertRaises(ValueError):
            check_scholarship_options("", 90, 200000)
        with self.assertRaises(ValueError):
            check_scholarship_options(85, "   ", 200000)

    def test_non_numeric_strings(self):
        """Reject non-numeric text strings."""
        with self.assertRaises(ValueError):
            check_scholarship_options("ninety", 90, 200000)

    def test_nan_and_infinity(self):
        """Reject NaN, inf, and -inf values."""
        with self.assertRaises(ValueError):
            check_scholarship_options(float("nan"), 90, 200000)
        with self.assertRaises(ValueError):
            check_scholarship_options(85, float("inf"), 200000)
        with self.assertRaises(ValueError):
            check_scholarship_options(85, 90, float("-inf"))

    def test_valid_string_conversion(self):
        """String representation of valid numbers should parse correctly."""
        val = validate_numeric_input("85.5", "Academic", 0.0, 100.0)
        self.assertEqual(val, 85.5)


if __name__ == "__main__":
    unittest.main()
