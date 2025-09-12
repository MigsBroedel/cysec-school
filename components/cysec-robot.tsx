interface CysecRobotProps {
  size?: "sm" | "md" | "lg"
  animated?: boolean
  className?: string
}

export function CysecRobot({ size = "md", animated = true, className = "" }: CysecRobotProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full ${animated ? "animate-pulse" : ""}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Robot Body */}
        <rect
          x="25"
          y="35"
          width="50"
          height="45"
          rx="8"
          fill="url(#robotGradient)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        {/* Robot Head */}
        <rect
          x="30"
          y="15"
          width="40"
          height="30"
          rx="15"
          fill="url(#headGradient)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        {/* Eyes */}
        <circle
          cx="40"
          cy="28"
          r="4"
          fill="currentColor"
          className={`text-accent ${animated ? "animate-pulse" : ""}`}
        />
        <circle
          cx="60"
          cy="28"
          r="4"
          fill="currentColor"
          className={`text-accent ${animated ? "animate-pulse" : ""}`}
        />

        {/* Eye pupils */}
        <circle cx="40" cy="28" r="2" fill="currentColor" className="text-primary" />
        <circle cx="60" cy="28" r="2" fill="currentColor" className="text-primary" />

        {/* Mouth */}
        <rect x="45" y="35" width="10" height="3" rx="1.5" fill="currentColor" className="text-primary" />

        {/* Antenna */}
        <line x1="50" y1="15" x2="50" y2="8" stroke="currentColor" strokeWidth="2" className="text-primary" />
        <circle cx="50" cy="8" r="2" fill="currentColor" className={`text-accent ${animated ? "animate-ping" : ""}`} />

        {/* Arms */}
        <rect
          x="15"
          y="45"
          width="8"
          height="20"
          rx="4"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          className="text-muted"
        />
        <rect
          x="77"
          y="45"
          width="8"
          height="20"
          rx="4"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          className="text-muted"
        />

        {/* Hands */}
        <circle cx="19" cy="68" r="3" fill="currentColor" className="text-primary" />
        <circle cx="81" cy="68" r="3" fill="currentColor" className="text-primary" />

        {/* Chest Panel */}
        <rect
          x="35"
          y="50"
          width="30"
          height="15"
          rx="3"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          className="text-card"
        />

        {/* Chest Details */}
        <rect x="38" y="53" width="6" height="2" rx="1" fill="currentColor" className="text-primary" />
        <rect x="38" y="57" width="4" height="2" rx="1" fill="currentColor" className="text-accent" />
        <rect x="38" y="61" width="8" height="2" rx="1" fill="currentColor" className="text-primary" />

        {/* Shield Symbol - Security Badge */}
        <path
          d="M55 53 L58 56 L62 52"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-secondary"
        />

        {/* Gradients using CSS custom properties */}
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-muted)" />
            <stop offset="100%" stopColor="var(--color-card)" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-card)" />
            <stop offset="100%" stopColor="var(--color-muted)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
