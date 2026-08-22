import { useEffect, useState } from "react";
import api from "../services/api";

export default function Payroll({ employeeId }) {
  const [payroll, setPayroll] = useState(null);

  useEffect(() => {
    api.get(`/payroll/${employeeId}/latest`).then((res) => setPayroll(res.data));
  }, [employeeId]);

  if (!payroll) return <p>Loading...</p>;

  return (
    <div className="payroll-card">
      <h2>Salary Information</h2>
      <table>
        <tbody>
          <tr><td>Basic</td><td>₹{payroll.basic}</td></tr>
          <tr><td>HRA</td><td>₹{payroll.hra}</td></tr>
          <tr><td>PF</td><td>₹{payroll.pf}</td></tr>
          <tr><td>Professional Tax</td><td>₹{payroll.professional_tax}</td></tr>
          <tr className="divider"><td>Gross</td><td>₹{payroll.gross}</td></tr>
          <tr><td>Working Days</td><td>{payroll.working_days}</td></tr>
          <tr><td>Payable Days</td><td>{payroll.payable_days}</td></tr>
          <tr><td>Attendance Deduction</td><td>₹{payroll.deductions}</td></tr>
          <tr className="net"><td>Net Pay</td><td>₹{payroll.net_pay}</td></tr>
        </tbody>
      </table>
    </div>
  );
}