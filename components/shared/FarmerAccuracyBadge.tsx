interface FarmerAccuracyBadgeProps {
  accuracy: number;
  showLabel?: boolean;
}

/**
 * Displays farmer accuracy badge based on score.
 * >= 90: green "Reliable"
 * >= 70: amber "Check qty"
 * < 70:  red "Low accuracy"
 *
 * Per 18_gap_fixes.md Gap 6.
 */
export function FarmerAccuracyBadge({
  accuracy,
  showLabel = true,
}: FarmerAccuracyBadgeProps) {
  if (accuracy >= 90) {
    return (
      <span className="badge badge-green" id="farmer-accuracy-badge">
        ✅ {showLabel ? 'Reliable' : `${accuracy.toFixed(0)}%`}
      </span>
    );
  }
  if (accuracy >= 70) {
    return (
      <span className="badge badge-amber" id="farmer-accuracy-badge">
        ⚡ {showLabel ? 'Check qty' : `${accuracy.toFixed(0)}%`}
      </span>
    );
  }
  return (
    <span className="badge badge-red" id="farmer-accuracy-badge">
      ⚠️ {showLabel ? 'Low accuracy' : `${accuracy.toFixed(0)}%`}
    </span>
  );
}
