export function validateAlertThreshold(alertType: "upper" | "lower", threshold: string | number, currentPrice: number) {
  const thresholdNum = Number(threshold)

  if (Number.isNaN(thresholdNum) || thresholdNum <= 0) {
    return "Please enter a valid price threshold"
  }

  if (currentPrice === undefined || Number.isNaN(currentPrice)) {
    return null
  }

  if (alertType === "upper" && thresholdNum <= currentPrice) {
    return `An above alert must be higher than $${currentPrice.toFixed(2)}`
  }

  if (alertType === "lower" && thresholdNum >= currentPrice) {
    return `A below alert must be lower than $${currentPrice.toFixed(2)}`
  }

  return null
}
