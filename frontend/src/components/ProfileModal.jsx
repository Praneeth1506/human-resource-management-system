import { useState } from "react";
import Avatar from "./Avatar";
import StatusDot from "./StatusDot";

/**
 * ProfileModal component
 * Supports viewing Employee Profile (view-only) or Admin "My Profile"
 * Tabs: Profile | Private Info | Salary Info (Admin view)
 */
export default function ProfileModal({
  isOpen,
  onClose,
  employee,
  isAdmin = true,
}) {
  const [activeTab, setActiveTab] = useState("profile");

  if (!isOpen || !employee) return null;

  // Formatted fallback values for salary preview
  const wage = employee.wage || 60000;
  const basicPct = 60;
  const basicAmt = (wage * basicPct) / 100;
  const hraPct = 50; // 50% of basic
  const hraAmt = (basicAmt * hraPct) / 100;
  const standardAllowance = 4000;
  const performanceBonus = 3000;
  const fixedAllowance = wage - (basicAmt + hraAmt + standardAllowance + performanceBonus);
  const pfDeduction = (basicAmt * 12) / 100;
  const professionalTax = 200;
  const totalDeduction = pfDeduction + professionalTax;
  const netSalary = wage - totalDeduction;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container profile-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="profile-modal-identity">
            <Avatar
              initials={employee.initials || employee.name?.substring(0, 2).toUpperCase() || "EP"}
              name={employee.name || "Employee"}
              size="lg"
              status={employee.status}
              paletteIndex={employee.id || 0}
            />
            <div>
              <div className="profile-name-row">
                <h3>{employee.name || `${employee.first_name} ${employee.last_name}`}</h3>
                <StatusDot status={employee.status || "present"} showLabel size="md" />
              </div>
              <p className="profile-role-sub">
                {employee.role || employee.job_title || "Team Member"} • {employee.department || "Operations"}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="profile-tabs-nav">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === "private" ? "active" : ""}`}
            onClick={() => setActiveTab("private")}
          >
            Private Info
          </button>
          {isAdmin && (
            <button
              className={`tab-btn ${activeTab === "salary" ? "active" : ""}`}
              onClick={() => setActiveTab("salary")}
            >
              Salary Info <span className="tab-badge-admin">Admin</span>
            </button>
          )}
        </div>

        <div className="profile-tab-content">
          {activeTab === "profile" && (
            <div className="tab-pane">
              <div className="profile-info-grid">
                <div className="info-item">
                  <span className="info-label">Employee ID</span>
                  <span className="info-value font-mono">EMP-{String(employee.id || "101").padStart(4, "0")}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{employee.email || `${employee.name?.toLowerCase().replace(/\s+/g, ".")}@company.com`}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{employee.department || "Engineering & Product"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Work Location</span>
                  <span className="info-value">Headquarters (On-site)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Joining Date</span>
                  <span className="info-value">Jan 15, 2024</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Reporting Manager</span>
                  <span className="info-value">Alex Morgan (VP People)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "private" && (
            <div className="tab-pane">
              <div className="profile-info-grid">
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">+91 98765 43210</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">Parent / Spouse (+91 98765 00000)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Birth</span>
                  <span className="info-value">12 Aug 1996</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bank Account</span>
                  <span className="info-value font-mono">HDFC •••• 8842</span>
                </div>
                <div className="info-item">
                  <span className="info-label">PAN Number</span>
                  <span className="info-value font-mono">ABCDE1234F</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Residing City</span>
                  <span className="info-value">Bengaluru, India</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "salary" && isAdmin && (
            <div className="tab-pane salary-info-pane">
              <div className="salary-header-cards">
                <div className="salary-stat-pill purple">
                  <span className="stat-label">Monthly Gross Wage</span>
                  <strong className="stat-amount">₹{wage.toLocaleString()}</strong>
                </div>
                <div className="salary-stat-pill green">
                  <span className="stat-label">Annual CTC</span>
                  <strong className="stat-amount">₹{(wage * 12).toLocaleString()}</strong>
                </div>
                <div className="salary-stat-pill pink">
                  <span className="stat-label">Est. Net Take-Home</span>
                  <strong className="stat-amount">₹{netSalary.toLocaleString()}</strong>
                </div>
              </div>

              <div className="salary-components-table-wrap">
                <div className="table-caption">Earnings & Allowances Breakdown</div>
                <table className="modal-salary-table">
                  <thead>
                    <tr>
                      <th>Salary Component</th>
                      <th>Computation / Type</th>
                      <th className="text-right">Monthly Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Basic Salary</strong></td>
                      <td><span className="calc-tag">{basicPct}% of Total Wage</span></td>
                      <td className="text-right font-mono">₹{basicAmt.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td><strong>House Rent Allowance (HRA)</strong></td>
                      <td><span className="calc-tag">{hraPct}% of Basic</span></td>
                      <td className="text-right font-mono">₹{hraAmt.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td><strong>Standard Allowance</strong></td>
                      <td><span className="calc-tag">Fixed Monthly</span></td>
                      <td className="text-right font-mono">₹{standardAllowance.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td><strong>Performance Bonus</strong></td>
                      <td><span className="calc-tag">Monthly KPI</span></td>
                      <td className="text-right font-mono">₹{performanceBonus.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td><strong>Fixed / Travel Allowance</strong></td>
                      <td><span className="calc-tag">Balancing Component</span></td>
                      <td className="text-right font-mono">₹{Math.max(0, fixedAllowance).toLocaleString()}</td>
                    </tr>
                    <tr className="subtotal-row">
                      <td colSpan="2"><strong>Total Monthly Wage (Gross)</strong></td>
                      <td className="text-right font-mono"><strong>₹{wage.toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="salary-components-table-wrap" style={{ marginTop: "16px" }}>
                <div className="table-caption">Statutory Deductions & Contributions</div>
                <table className="modal-salary-table">
                  <tbody>
                    <tr>
                      <td>Provident Fund (PF) Contribution</td>
                      <td><span className="calc-tag">12% of Basic</span></td>
                      <td className="text-right font-mono deduction-text">- ₹{pfDeduction.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Professional Tax (PT)</td>
                      <td><span className="calc-tag">State Statutory</span></td>
                      <td className="text-right font-mono deduction-text">- ₹{professionalTax.toLocaleString()}</td>
                    </tr>
                    <tr className="net-row">
                      <td colSpan="2"><strong>Computed Net In-Hand</strong></td>
                      <td className="text-right font-mono net-pay-highlight"><strong>₹{netSalary.toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="primary-btn small-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
