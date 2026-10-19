"""Scholarship Eligibility Tool.

Provides deterministic eligibility verification and recommendation
for the Merit and Access scholarships according to educational rules.
"""

from typing import Dict, Any, List, Optional
import math


def validate_numeric_input(value: Any, field_name: str, min_val: Optional[float] = None, max_val: Optional[float] = None) -> float:
    """Validate and convert input to a finite floating-point number within bounds."""
    if value is None:
        raise ValueError(f"{field_name} is required.")
    
    if isinstance(value, str):
        value_str = value.strip()
        if not value_str:
            raise ValueError(f"{field_name} cannot be empty.")
        try:
            parsed = float(value_str)
        except ValueError:
            raise ValueError(f"{field_name} must be a valid number.")
    elif isinstance(value, (int, float)):
        parsed = float(value)
    else:
        raise ValueError(f"{field_name} must be a valid numeric type.")

    if math.isnan(parsed) or math.isinf(parsed):
        raise ValueError(f"{field_name} must be a finite number.")

    if min_val is not None and parsed < min_val:
        raise ValueError(f"{field_name} must be at least {min_val}.")

    if max_val is not None and parsed > max_val:
        raise ValueError(f"{field_name} cannot exceed {max_val}.")

    return parsed


def check_scholarship_options(
    academic_percentage: float,
    attendance_percentage: float,
    annual_family_income: float
) -> Dict[str, Any]:
    """Evaluate eligibility for Merit and Access scholarships.

    Parameters:
        academic_percentage: float (0.0 to 100.0)
        attendance_percentage: float (0.0 to 100.0)
        annual_family_income: float (>= 0.0)

    Returns:
        dict containing:
            - eligible_scholarships: list of {name, award}
            - recommended_scholarship: str or None
            - recommended_award: int or None
    """
    # Strict validation
    acad = validate_numeric_input(academic_percentage, "Academic percentage", min_val=0.0, max_val=100.0)
    att = validate_numeric_input(attendance_percentage, "Attendance percentage", min_val=0.0, max_val=100.0)
    income = validate_numeric_input(annual_family_income, "Annual family income", min_val=0.0)

    eligible_scholarships: List[Dict[str, Any]] = []

    # 1. Check Merit Scholarship independently
    # - Academic percentage >= 85
    # - Attendance percentage >= 90
    # - No family-income restriction
    if acad >= 85.0 and att >= 90.0:
        eligible_scholarships.append({
            "name": "Merit Scholarship",
            "award": 15000
        })

    # 2. Check Access Scholarship independently
    # - Academic percentage >= 60
    # - Attendance percentage >= 75
    # - Annual family income <= 250000
    if acad >= 60.0 and att >= 75.0 and income <= 250000.0:
        eligible_scholarships.append({
            "name": "Access Scholarship",
            "award": 10000
        })

    # Determine recommendation
    if not eligible_scholarships:
        return {
            "eligible_scholarships": [],
            "recommended_scholarship": None,
            "recommended_award": None
        }

    # Select eligible scholarship with highest award amount
    recommended = max(eligible_scholarships, key=lambda s: s["award"])

    return {
        "eligible_scholarships": eligible_scholarships,
        "recommended_scholarship": recommended["name"],
        "recommended_award": recommended["award"]
    }
