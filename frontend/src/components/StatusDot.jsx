/**
 * StatusDot component
 * @param {'present' | 'leave' | 'absent'} status - Current attendance status
 * @param {'sm' | 'md' | 'lg'} size - Dot size
 * @param {boolean} pulse - Whether to show subtle live pulse animation
 * @param {boolean} showLabel - Whether to display text label next to dot
 * @param {string} className - Additional CSS classes
 */
export default function StatusDot({
  status = "present",
  size = "md",
  pulse = false,
  showLabel = false,
  className = "",
}) {
  const normalizedStatus = status?.toLowerCase() || "absent";

  const labels = {
    present: "Present",
    leave: "On Leave",
    absent: "Absent",
  };

  const statusLabel = labels[normalizedStatus] || "Unknown";

  return (
    <span
      className={`status-dot-container size-${size} ${className}`}
      title={`Status: ${statusLabel}`}
    >
      <span
        className={`status-dot ${normalizedStatus} ${pulse ? "pulse" : ""}`}
        aria-label={statusLabel}
      />
      {showLabel && <span className={`status-label text-${normalizedStatus}`}>{statusLabel}</span>}
    </span>
  );
}
