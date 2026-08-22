from typing import Optional

from sqlalchemy.orm import Session

import backend.models as models
import backend.services.payroll_service as payroll_service

# Threshold-based flag, NOT a machine-learning model - three fixed weights
# and two cutoffs, no training data, no library, fully deterministic and
# explainable from the numbers in the response alone. If asked, describe it
# exactly that way.
ABSENT_DAY_WEIGHT = 2
UNPAID_LEAVE_DAY_WEIGHT = 1
LATE_DAY_WEIGHT = 1

LOW_MAX_SCORE = 2
MEDIUM_MAX_SCORE = 6

# Fixed recommendation text - same "not ML" rule as above: a lookup table
# keyed by risk_level or by whichever factor contributes the most to
# risk_score, nothing learned or inferred beyond that.
RECOMMENDATION_BY_RISK_LEVEL = {
    "LOW": "No immediate action required.",
    "MEDIUM": "Monitor attendance and review recent late arrivals.",
    "HIGH": "Schedule an attendance review and monitor closely.",
}

RECOMMENDATION_BY_DOMINANT_FACTOR = {
    "absent": "Review the employee's attendance pattern.",
    "late": "Monitor punctuality and review recent late arrivals.",
    "unpaid_leave": "Review recent unpaid leave usage.",
}


def _count_late_days(db: Session, employee_id: int, month: int, year: int) -> int:
    month_start, month_end = payroll_service._month_bounds(month, year)
    return (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == employee_id,
            models.Attendance.date >= month_start,
            models.Attendance.date <= month_end,
            models.Attendance.status == "late",
        )
        .count()
    )


def _classify_risk(risk_score: int) -> str:
    if risk_score <= LOW_MAX_SCORE:
        return "LOW"
    if risk_score <= MEDIUM_MAX_SCORE:
        return "MEDIUM"
    return "HIGH"


def _dominant_factor(absent_days: int, unpaid_leave_days: int, late_days: int) -> Optional[str]:
    """Whichever of the three weighted contributions to risk_score is
    strictly the largest. None if two or more are tied for the top spot
    (no single dominant reason) or all are zero.
    """
    contributions = {
        "absent": absent_days * ABSENT_DAY_WEIGHT,
        "unpaid_leave": unpaid_leave_days * UNPAID_LEAVE_DAY_WEIGHT,
        "late": late_days * LATE_DAY_WEIGHT,
    }
    top_value = max(contributions.values())
    if top_value == 0:
        return None
    top_factors = [factor for factor, value in contributions.items() if value == top_value]
    return top_factors[0] if len(top_factors) == 1 else None


def _recommend_action(
    risk_level: str, absent_days: int, unpaid_leave_days: int, late_days: int
) -> str:
    """LOW is always the same message. Otherwise, defer to whichever single
    factor dominates risk_score for a more specific recommendation; fall
    back to the plain risk_level message when no one factor clearly
    dominates (multiple factors contributing about equally).
    """
    if risk_level == "LOW":
        return RECOMMENDATION_BY_RISK_LEVEL["LOW"]

    dominant = _dominant_factor(absent_days, unpaid_leave_days, late_days)
    if dominant is not None:
        return RECOMMENDATION_BY_DOMINANT_FACTOR[dominant]
    return RECOMMENDATION_BY_RISK_LEVEL[risk_level]


def calculate_attendance_risk(db: Session, employee_id: int, month: int, year: int) -> dict:
    """Rule-based attendance risk flag for one employee/month, computed
    entirely from existing attendance + leave rows:

        risk_score = absent_days*2 + unpaid_leave_days*1 + late_days*1
        <=2 LOW, 3-6 MEDIUM, >6 HIGH

    Not ML - a fixed, explainable weighted sum with two cutoffs.
    """
    month_start, month_end = payroll_service._month_bounds(month, year)
    has_attendance_data = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == employee_id,
            models.Attendance.date >= month_start,
            models.Attendance.date <= month_end,
        )
        .first()
        is not None
    )

    if not has_attendance_data:
        return {
            "employee_id": employee_id,
            "month": month,
            "year": year,
            "risk_level": "LOW",
            "absent_days": 0,
            "unpaid_leave_days": 0,
            "late_days": 0,
            "risk_score": 0,
            "note": "insufficient data",
            "recommendation": RECOMMENDATION_BY_RISK_LEVEL["LOW"],
        }

    absent_days = payroll_service.count_unexcused_absence_days(db, employee_id, month, year)
    unpaid_leave_days = payroll_service.count_unpaid_leave_days(db, employee_id, month, year)
    late_days = _count_late_days(db, employee_id, month, year)

    risk_score = (
        absent_days * ABSENT_DAY_WEIGHT
        + unpaid_leave_days * UNPAID_LEAVE_DAY_WEIGHT
        + late_days * LATE_DAY_WEIGHT
    )
    risk_level = _classify_risk(risk_score)

    return {
        "employee_id": employee_id,
        "month": month,
        "year": year,
        "risk_level": risk_level,
        "absent_days": absent_days,
        "unpaid_leave_days": unpaid_leave_days,
        "late_days": late_days,
        "risk_score": risk_score,
        "note": None,
        "recommendation": _recommend_action(risk_level, absent_days, unpaid_leave_days, late_days),
    }
