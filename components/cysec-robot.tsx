interface CysecRobotProps {
  size?: "sm" | "md" | "lg"
  animated?: boolean
  className?: string
}

export function CysecRobot({ size = "md", animated = true, className = "" }: CysecRobotProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
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
        <rect x="25" y="35" width="50" height="45" rx="8" fill="url(#robotGradient)" stroke="#3B82F6" strokeWidth="2" />

        {/* Robot Head */}
        <rect x="30" y="15" width="40" height="30" rx="15" fill="url(#headGradient)" stroke="#3B82F6" strokeWidth="2" />

        {/* Eyes */}
        <circle cx="40" cy="28" r="4" fill="#60A5FA" className={animated ? "animate-pulse" : ""} />
        <circle cx="60" cy="28" r="4" fill="#60A5FA" className={animated ? "animate-pulse" : ""} />

        {/* Eye pupils */}
        <circle cx="40" cy="28" r="2" fill="#1E40AF" />
        <circle cx="60" cy="28" r="2" fill="#1E40AF" />

        {/* Mouth */}
        <rect x="45" y="35" width="10" height="3" rx="1.5" fill="#3B82F6" />

        {/* Antenna */}
        <line x1="50" y1="15" x2="50" y2="8" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="50" cy="8" r="2" fill="#60A5FA" className={animated ? "animate-ping" : ""} />

        {/* Arms */}
        <rect x="15" y="45" width="8" height="20" rx="4" fill="#374151" stroke="#3B82F6" strokeWidth="1" />
        <rect x="77" y="45" width="8" height="20" rx="4" fill="#374151" stroke="#3B82F6" strokeWidth="1" />

        {/* Hands */}
        <circle cx="19" cy="68" r="3" fill="#3B82F6" />
        <circle cx="81" cy="68" r="3" fill="#3B82F6" />

        {/* Chest Panel */}
        <rect x="35" y="50" width="30" height="15" rx="3" fill="#1F2937" stroke="#3B82F6" strokeWidth="1" />

        {/* Chest Details */}
        <rect x="38" y="53" width="6" height="2" rx="1" fill="#3B82F6" />
        <rect x="38" y="57" width="4" height="2" rx="1" fill="#60A5FA" />
        <rect x="38" y="61" width="8" height="2" rx="1" fill="#3B82F6" />

        {/* Shield Symbol */}
        <path
          d="M55 53 L58 56 L62 52"
          stroke="#10B981"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4B5563" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
