import StatusDot from "./StatusDot";

/**
 * Avatar component matching Image 2 SaaS aesthetic
 * Soft gradient background with crisp initials or image, optional status dot badge
 */
const GRADIENT_PALETTES = [
  "linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%)",
  "linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)",
  "linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)",
  "linear-gradient(135deg, #bbf7d0 0%, #34d399 100%)",
  "linear-gradient(135deg, #bae6fd 0%, #60a5fa 100%)",
  "linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%)",
];

export default function Avatar({
  initials = "U",
  name = "User",
  src = null,
  size = "md", // 'sm' (28px), 'md' (40px), 'lg' (54px), 'xl' (72px)
  status = null,
  paletteIndex = 0,
  className = "",
}) {
  const gradient = GRADIENT_PALETTES[Math.abs(paletteIndex) % GRADIENT_PALETTES.length];

  return (
    <div className={`avatar-wrapper size-${size} ${className}`} title={name}>
      {src ? (
        <img src={src} alt={name} className="avatar-img" />
      ) : (
        <div className="avatar-initials" style={{ background: gradient }}>
          {initials}
        </div>
      )}
      {status && (
        <div className="avatar-status-badge">
          <StatusDot status={status} size="sm" pulse={status === "present"} />
        </div>
      )}
    </div>
  );
}
