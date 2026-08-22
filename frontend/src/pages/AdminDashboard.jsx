import { useEffect, useState } from "react";
import api from "../services/api";
import EmployeeCard from "../components/EmployeeCard";
import ProfileModal from "../components/ProfileModal";
import StatusDot from "../components/StatusDot";

const INITIAL_TEAM_MEMBERS = [
  {
    id: 1,
    name: "Alicia Martin",
    role: "Product Designer",
    department: "Design & UX",
    status: "present",
    initials: "AM",
    email: "alicia.martin@dayflow.com",
    wage: 90000,
  },
  {
    id: 2,
    name: "Daniel Lee",
    role: "Frontend Engineer",
    department: "Engineering",
    status: "leave",
    initials: "DL",
    email: "daniel.lee@dayflow.com",
    wage: 85000,
  },
  {
    id: 3,
    name: "Priya Shah",
    role: "HR Manager",
    department: "People Ops",
    status: "present",
    initials: "PS",
    email: "priya.shah@dayflow.com",
    wage: 75000,
  },
  {
    id: 4,
    name: "Marco Silva",
    role: "DevOps Engineer",
    department: "Infrastructure",
    status: "absent",
    initials: "MS",
    email: "marco.silva@dayflow.com",
    wage: 88000,
  },
  {
    id: 5,
    name: "Nina Patel",
    role: "Finance Lead",
    department: "Finance",
    status: "present",
    initials: "NP",
    email: "nina.patel@dayflow.com",
    wage: 82000,
  },
  {
    id: 6,
    name: "Owen Brooks",
    role: "Customer Support",
    department: "Support",
    status: "leave",
    initials: "OB",
    email: "owen.brooks@dayflow.com",
    wage: 65000,
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
      {/* 4-Column Metric Cards Grid */}
      <section className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-title">Total Employees</span>
            <span className="admin-metric-badge teal">Active</span>
          </div>
          <div className="admin-metric-val-row">
            <strong className="admin-metric-num">{stats.total_employees}</strong>
            <span className="admin-metric-sub">members</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-title">Present Today</span>
            <StatusDot status="present" size="sm" pulse />
          </div>
          <div className="admin-metric-val-row">
            <strong className="admin-metric-num">{stats.present_today}</strong>
            <span className="admin-metric-sub">/{stats.total_employees}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-title">Absent Today</span>
            <StatusDot status="absent" size="sm" />
          </div>
          <div className="admin-metric-val-row">
            <strong className="admin-metric-num">{stats.absent_today}</strong>
            <span className="admin-metric-sub">staff</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-title">Pending Leave</span>
            <StatusDot status="leave" size="sm" />
          </div>
          <div className="admin-metric-val-row">
            <strong className="admin-metric-num">{stats.pending_leaves}</strong>
            <span className="admin-metric-sub">requests</span>
          </div>
        </div>
      </section>

      {/* Main 2-Column Section: Directory & Action Center */}
      <div className="dashboard-columns-layout">
        {/* Left Column: Employee Directory */}
        <div className="dashboard-main-column">
          <section className="saas-card">
            <div className="card-header-flex">
              <div>
                <h2 className="card-title">Employee Directory</h2>
                <p className="card-subtitle">
                  Click any employee card to inspect view-only profile and compensation.
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
            </div>
          </section>
        </div>

        {/* Right Column: Action Center */}
        <aside className="dashboard-side-column">
          <section className="saas-card action-center-card">
            <div className="action-center-header">
              <div className="action-title-row">
                <h3 className="card-title">Action Center</h3>
              </div>
              <span className="attention-counter-pill">
                {(stats.needs_attention?.low_attendance_employees?.length || 0) +
                  (stats.needs_attention?.pending_leave_count > 0 ? 1 : 0)}{" "}
                Flags
              </span>
            </div>
            <p className="card-subtitle">
              High-priority items requiring attention.
            </p>

            <div className="action-alerts-list">
              {stats.needs_attention?.low_attendance_employees?.map((emp) => (
                <div key={emp.id} className="alert-card alert-warning">
                  <div className="alert-icon-box warning">
                    <span>⚠️</span>
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Low Attendance</div>
                    <p className="alert-desc">
                      <strong>
                        {emp.first_name} {emp.last_name}
                      </strong>{" "}
                      has {emp.pct}% attendance this month.
                    </p>
                    <button
                      className="alert-link-btn"
                      onClick={() => {
                        const target = teamMembers.find((m) => m.id === emp.id);
                        if (target) setSelectedEmployee(target);
                      }}
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}

              {stats.needs_attention?.pending_leave_count > 0 && (
                <div className="alert-card alert-danger">
                  <div className="alert-icon-box danger">
                    <span>📋</span>
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Pending Leave Requests</div>
                    <p className="alert-desc">
                      <strong>{stats.needs_attention.pending_leave_count} requests</strong> awaiting approval.
                    </p>
                  </div>
                </div>
              )}

              <div className="alert-card alert-info">
                <div className="alert-icon-box info">
                  <span>💡</span>
                </div>
                <div className="alert-content">
                  <div className="alert-title">Payroll Policy Notice</div>
                  <p className="alert-desc">
                    Attendance records serve as the basis for payroll generation.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* View-Only Profile Modal */}
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