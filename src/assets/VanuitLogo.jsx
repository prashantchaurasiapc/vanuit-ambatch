// Vanuit Ambacht Official Logo – VA Monogram (based on brandbook)
export default function VanuitLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* VA Monogram – stylized double-V form from brandbook */}
      <path
        d="M10 15 L35 80 L50 45 L65 80 L90 15"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 15 L50 68 L78 15"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
