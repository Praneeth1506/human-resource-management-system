import React from "react";
import Avatar from "./Avatar";
import StatusDot from "./StatusDot";

/**
 * EmployeeCard component
 * Renders an employee card in a grid, showing avatar + basic info + status dot in the top-right corner.
 * Clicking the card opens the employee's profile in view-only mode.
 */
export default function EmployeeCard({ employee, onClick, paletteIndex = 0 }) {
  const { name, role, department, status, initials } = employee;

  return (
    <div
      className="employee-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="employee-topbar">
        <Avatar
          initials={initials || name?.substring(0, 2).toUpperCase()}
          name={name}
          size="md"
          paletteIndex={paletteIndex}
        />
        <StatusDot status={status} size="md" pulse={status === "present"} />
      </div>

      <div className="employee-info">
        <h4 className="employee-name">{name}</h4>
        <p className="employee-role">{role}</p>
        {department && <span className="employee-dept">{department}</span>}
      </div>

      <div className="employee-footer">
        <span className={`pill ${status}`}>
          {status === "present" ? "Present" : status === "leave" ? "On Leave" : "Absent"}
        </span>
        <span className="view-profile-hint">View Profile →</span>
      </div>
    </div>
  );
}
