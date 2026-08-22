import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Payroll() {
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get("/payroll/me/history")
      .then((res) => {
        if (res.data.length === 0) setNotFound(true);
        else setPayroll(res.data[0]);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <p>Payroll data isn't available yet.</p>;
  if (notFound) return <p>No payroll records found yet.</p>;
  if (!payroll) return <p>Loading...</p>;

  return (
    <div className="payroll-card">
      <h2>Salary Information</h2>
      <table>
        <tbody>
          <tr><td>Basic</td><td>₹{Number(payroll.basic).toFixed(2)}</td></tr>
          <tr><td>HRA</td><td>₹{Number(payroll.hra).toFixed(2)}</td></tr>
          <tr><td>PF</td><td>₹{Number(payroll.pf).toFixed(2)}</td></tr>
          <tr><td>Professional Tax</td><td>₹{Number(payroll.professional_tax).toFixed(2)}</td></tr>
          <tr className="divider"><td>Gross</td><td>₹{Number(payroll.gross).toFixed(2)}</td></tr>
          <tr><td>Working Days</td><td>{payroll.working_days}</td></tr>
          <tr><td>Payable Days</td><td>{payroll.payable_days}</td></tr>
          <tr><td>Attendance Deduction</td><td>₹{Number(payroll.deductions).toFixed(2)}</td></tr>
          <tr className="net"><td>Net Pay</td><td>₹{Number(payroll.net_pay).toFixed(2)}</td></tr>
        </tbody>
      </table>
    </div>
  );
}