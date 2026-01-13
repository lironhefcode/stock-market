export type PortfolioSnapshotInput = {
  initialValue: number
  currentValue: number
}

export type PortfolioSnapshotValidation =
  | { valid: true; data: PortfolioSnapshotInput }
  | { valid: false; message: string }

const normalizeAmount = (value: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return NaN
  }
  return parseFloat(parsed.toFixed(2))
}

export const validatePortfolioSnapshot = (input: PortfolioSnapshotInput): PortfolioSnapshotValidation => {
  const initialValue = normalizeAmount(input.initialValue)
  const currentValue = normalizeAmount(input.currentValue)

  if (Number.isNaN(initialValue) || Number.isNaN(currentValue)) {
    return { valid: false, message: "Amounts must be valid numbers" }
  }

  if (initialValue <= 0) {
    return { valid: false, message: "Total cost must be greater than zero" }
  }

  if (currentValue < 0) {
    return {
      valid: false,
      message: "Current value cannot be negative",
    }
  }

  return {
    valid: true,
    data: {
      initialValue,
      currentValue,
    },
  }
}

export const calculateGainPercent = (snapshot: PortfolioSnapshotInput) => {
  if (snapshot.initialValue <= 0) return 0
  const gain = ((snapshot.currentValue - snapshot.initialValue) / snapshot.initialValue) * 100
  return parseFloat(gain.toFixed(2))
}
