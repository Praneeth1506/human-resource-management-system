import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Payroll() {
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        api
            .get("/payroll/me/history")
            .then((res) => {
                setPayroll(res.data.length > 0 ? res.data[0] : null);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Could not load payroll data.</p>;
    if (!payroll) return <p>No payroll records yet.</p>;

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
