import { useEffect, useState } from "react";
import api from "../services/api";
import EmployeeCard from "../components/EmployeeCard";
import ProfileModal from "../components/ProfileModal";
import StatusDot from "../components/StatusDot";

// Comprehensive employee directory dataset
const INITIAL_TEAM_MEMBERS = [
  {
    id: 1,
    name: "Alicia Martin",
    role: "Lead Product Designer",
    department: "Design & UX",
    status: "present",
    initials: "AM",
    email: "alicia.martin@company.com",
    wage: 90000,
  },
  {
    id: 2,
    name: "Daniel Lee",
    role: "Senior Frontend Engineer",
    department: "Engineering",
    status: "leave",
    initials: "DL",
    email: "daniel.lee@company.com",
    wage: 85000,
  },
  {
    id: 3,
    name: "Priya Shah",
    role: "HR & Talent Specialist",
    department: "People Operations",
    status: "present",
    initials: "PS",
    email: "priya.shah@company.com",
    wage: 75000,
  },
  {
    id: 4,
    name: "Marco Silva",
    role: "DevOps & Cloud Engineer",
    department: "Infrastructure",
    status: "absent",
    initials: "MS",
    email: "marco.silva@company.com",
    wage: 88000,
  },
  {
    id: 5,
    name: "Nina Patel",
    role: "Finance & Payroll Lead",
    department: "Finance",
    status: "present",
    initials: "NP",
    email: "nina.patel@company.com",
    wage: 82000,
  },
  {
    id: 6,
    name: "Owen Brooks",
    role: "Customer Success Manager",
    department: "Support",
    status: "leave",
    initials: "OB",
    email: "owen.brooks@company.com",
    wage: 65000,
  },
  {
    id: 7,
    name: "Sophia Chen",
    role: "Backend Architect",
    department: "Engineering",
    status: "present",
    initials: "SC",
    email: "sophia.chen@company.com",
    wage: 95000,
  },
  {
    id: 8,
    name: "Lucas Vance",
    role: "QA Automation Lead",
    department: "Quality",
    status: "present",
    initials: "LV",
    email: "lucas.vance@company.com",
    wage: 72000,
  },
];

export default function AdminDashboard({ searchQuery = "" }) {
  const [data, setData] = useState(null);
  const [teamMembers] = useState(INITIAL_TEAM_MEMBERS);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api
      .get("/dashboard/admin")
      .then((res) => setData(res.data))
      .catch(() => {
        // High quality fallback data if backend is offline
        setData({
          total_employees: INITIAL_TEAM_MEMBERS.length,
          present_today: INITIAL_TEAM_MEMBERS.filter((m) => m.status === "present").length,
          absent_today: INITIAL_TEAM_MEMBERS.filter((m) => m.status === "absent").length,
          pending_leaves: INITIAL_TEAM_MEMBERS.filter((m) => m.status === "leave").length,
          needs_attention: {
            low_attendance_employees: [
              { id: 4, first_name: "Marco", last_name: "Silva", pct: 68 },
              { id: 6, first_name: "Owen", last_name: "Brooks", pct: 72 },
            ],
            pending_leave_count: 2,
          },
        });
      });
  }, []);

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = data || {
    total_employees: teamMembers.length,
    present_today: teamMembers.filter((m) => m.status === "present").length,
    absent_today: teamMembers.filter((m) => m.status === "absent").length,
    pending_leaves: teamMembers.filter((m) => m.status === "leave").length,
    needs_attention: {
      low_attendance_employees: [{ id: 4, first_name: "Marco", last_name: "Silva", pct: 68 }],
      pending_leave_count: 2,
    },
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header Banner */}
      <div className="dashboard-welcome-banner">
        <div>
          <span className="section-eyebrow">ADMINISTRATIVE CONSOLE</span>
          <h1 className="dashboard-heading">Organization Overview</h1>
          <p className="dashboard-subtext">
            Monitor real-time employee attendance, view profiles, and handle team operations.
          </p>
        </div>
        <div className="banner-stats-pill">
          <StatusDot status="present" pulse size="md" />
          <span>Live Sync Active</span>
        </div>
      </div>

      {/* Top Metric Cards with Theme Pastel Blocks */}
      <section className="dashboard-grid">
        {/* Metric 1: Total Employees */}
        <div className="metric-card purple">
          <div className="metric-head">
            <span className="metric-title">Total Employees</span>
            <div className="metric-icon-box purple">
              <span>👥</span>
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{stats.total_employees}</strong>
              <span className="metric-unit">Active</span>
            </div>
            <div className="metric-footer-badge purple">
              <span>↑ 2 joined this month</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Present Today */}
        <div className="metric-card green">
          <div className="metric-head">
            <span className="metric-title">Present Today</span>
            <div className="metric-icon-box green">
              <span>✓</span>
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{stats.present_today}</strong>
              <span className="metric-unit">/{stats.total_employees}</span>
            </div>
            <div className="metric-footer-badge green">
              <span>
                {Math.round((stats.present_today / (stats.total_employees || 1)) * 100)}% attendance rate
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Absent Today */}
        <div className="metric-card yellow">
          <div className="metric-head">
            <span className="metric-title">Absent / Not Checked In</span>
            <div className="metric-icon-box yellow">
              <span>⏱</span>
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{stats.absent_today}</strong>
              <span className="metric-unit">Staff</span>
            </div>
            <div className="metric-footer-badge yellow">
              <span>Unexcused absence</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Pending Leaves */}
        <div className="metric-card pink">
          <div className="metric-head">
            <span className="metric-title">Pending Time Off</span>
            <div className="metric-icon-box pink">
              <span>☕</span>
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{stats.pending_leaves}</strong>
              <span className="metric-unit">Requests</span>
            </div>
            <div className="metric-footer-badge pink">
              <span>Requires approval</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Section: Employee Directory Grid & Action Center */}
      <div className="dashboard-columns-layout">
        {/* Left Column: Employee Directory Grid */}
        <div className="dashboard-main-column">
          <section className="saas-card team-directory-card">
            <div className="card-header-flex">
              <div>
                <h2 className="card-title">Employee Directory</h2>
                <p className="card-subtitle">
                  Click any employee card to inspect their view-only profile and compensation details.
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="filter-chips">
                <button
                  className={`filter-chip ${statusFilter === "all" ? "active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  All ({teamMembers.length})
                </button>
                <button
                  className={`filter-chip ${statusFilter === "present" ? "active" : ""}`}
                  onClick={() => setStatusFilter("present")}
                >
                  <StatusDot status="present" size="sm" /> Present
                </button>
                <button
                  className={`filter-chip ${statusFilter === "leave" ? "active" : ""}`}
                  onClick={() => setStatusFilter("leave")}
                >
                  <StatusDot status="leave" size="sm" /> On Leave
                </button>
                <button
                  className={`filter-chip ${statusFilter === "absent" ? "active" : ""}`}
                  onClick={() => setStatusFilter("absent")}
                >
                  <StatusDot status="absent" size="sm" /> Absent
                </button>
              </div>
            </div>

            {/* Grid of Employee Cards */}
            <div className="employee-cards-grid">
              {filteredMembers.map((member, idx) => (
                <EmployeeCard
                  key={member.id}
                  employee={member}
                  paletteIndex={idx}
                  onClick={() => setSelectedEmployee(member)}
                />
              ))}

              {filteredMembers.length === 0 && (
                <div className="empty-search-state">
                  <span className="empty-icon">🔍</span>
                  <p>No employees found matching &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Action Center ("Needs Attention") */}
        <aside className="dashboard-side-column">
          <section className="saas-card action-center-card">
            <div className="action-center-header">
              <div className="action-title-row">
                <span className="action-badge-pulse" />
                <h3 className="card-title">Action Center</h3>
              </div>
              <span className="attention-counter-pill">
                {(stats.needs_attention?.low_attendance_employees?.length || 0) +
                  (stats.needs_attention?.pending_leave_count > 0 ? 1 : 0)}{" "}
                Flags
              </span>
            </div>
            <p className="card-subtitle">
              High-priority flags requiring HR review or payroll reconciliation.
            </p>

            <div className="action-alerts-list">
              {/* Low Attendance Alerts */}
              {stats.needs_attention?.low_attendance_employees?.map((emp) => (
                <div key={emp.id} className="alert-card alert-warning">
                  <div className="alert-icon-box warning">
                    <span>⚠️</span>
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Low Attendance Warning</div>
                    <p className="alert-desc">
                      <strong>
                        {emp.first_name} {emp.last_name}
                      </strong>{" "}
                      has dropped to <span className="highlight-pct">{emp.pct}%</span> monthly attendance.
                    </p>
                    <button
                      className="alert-link-btn"
                      onClick={() => {
                        const target = teamMembers.find((m) => m.id === emp.id);
                        if (target) setSelectedEmployee(target);
                      }}
                    >
                      View Profile & Attendance →
                    </button>
                  </div>
                </div>
              ))}

              {/* Pending Leave Requests */}
              {stats.needs_attention?.pending_leave_count > 0 && (
                <div className="alert-card alert-danger">
                  <div className="alert-icon-box danger">
                    <span>📋</span>
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Pending Leave Requests</div>
                    <p className="alert-desc">
                      <strong>{stats.needs_attention.pending_leave_count} team members</strong> are
                      awaiting leave approval for this pay period.
                    </p>
                    <button
                      className="alert-link-btn"
                      onClick={() =>
                        alert(
                          "Deep link to Time Off module: Time off approvals are handled by Time Off team."
                        )
                      }
                    >
                      Open Approval Queue →
                    </button>
                  </div>
                </div>
              )}

              {/* Attendance Data Payroll Linkage Notice */}
              <div className="alert-card alert-info">
                <div className="alert-icon-box info">
                  <span>💡</span>
                </div>
                <div className="alert-content">
                  <div className="alert-title">Payroll Linkage Notice</div>
                  <p className="alert-desc">
                    Attendance records serve as the basis for payroll generation. Unpaid leaves automatically reduce payable days.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* View-Only Profile Modal for Clicked Employee */}
      <ProfileModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        isAdmin={true}
        viewOnly={true}
      />
    </div>
  );
}