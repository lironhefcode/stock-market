"use server"

import { Alert as AlertModel, AlertDocument } from "@/db/models/alert"
import { connectToDatabase } from "@/db/mongoose"
import { validateAlertThreshold } from "@/lib/alert-utils"
import { getSession } from "./auth.actions"

function toAlert(doc: AlertDocument): Alert {
  return {
    id: String(doc._id),
    symbol: doc.symbol,
    company: doc.company,
    alertName: doc.alertName,
    alertType: doc.alertType,
    threshold: doc.threshold,
    priceAtCreation: doc.priceAtCreation,
    status: doc.status,
    lastCheckedPrice: doc.lastCheckedPrice ?? null,
    triggeredAt: doc.triggeredAt ? new Date(doc.triggeredAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  }
}

export async function createAlert(data: AlertData) {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return { success: false, message: "Not authenticated" }
    }

    const userId = res.session.user.id
    const validationError = validateAlertThreshold(data.alertType, data.threshold, data.currentPrice)
    if (validationError) {
      return { success: false, message: validationError }
    }

    const alert = await AlertModel.create({
      userId,
      symbol: data.symbol.toUpperCase(),
      company: data.company,
      alertName: data.alertName,
      alertType: data.alertType,
      threshold: Number(data.threshold),
      priceAtCreation: data.currentPrice,
      status: "active",
    })

    return { success: true, message: "Alert created successfully", alert: toAlert(alert) }
  } catch (error) {
    console.error("Error creating alert:", error)
    return { success: false, message: "Failed to create alert" }
  }
}

export async function updateAlert(alertId: string, data: Partial<AlertData>) {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return { success: false, message: "Not authenticated" }
    }

    const existing = await AlertModel.findOne({ _id: alertId, userId: res.session.user.id })
    if (!existing) {
      return { success: false, message: "Alert not found" }
    }

    const mergedAlertType = data.alertType ?? existing.alertType
    const mergedThreshold = data.threshold ?? existing.threshold

    if (data.alertType !== undefined || data.threshold !== undefined) {
      const validationError = validateAlertThreshold(mergedAlertType, mergedThreshold, existing.priceAtCreation)
      if (validationError) {
        return { success: false, message: validationError }
      }
    }

    const updateFields: { alertName?: string; alertType?: "upper" | "lower"; threshold?: number } = {}
    if (data.alertName !== undefined) updateFields.alertName = data.alertName
    if (data.alertType !== undefined) updateFields.alertType = data.alertType
    if (data.threshold !== undefined) updateFields.threshold = Number(data.threshold)

    const alert = await AlertModel.findOneAndUpdate({ _id: alertId, userId: res.session.user.id }, { $set: updateFields }, { new: true })

    return { success: true, message: "Alert updated successfully", alert: toAlert(alert) }
  } catch (error) {
    console.error("Error updating alert:", error)
    return { success: false, message: "Failed to update alert" }
  }
}

export async function deleteAlert(alertId: string) {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return { success: false, message: "Not authenticated" }
    }

    const result = await AlertModel.deleteOne({ _id: alertId, userId: res.session.user.id })
    if (result.deletedCount === 0) {
      return { success: false, message: "Alert not found" }
    }

    return { success: true, message: "Alert deleted successfully" }
  } catch (error) {
    console.error("Error deleting alert:", error)
    return { success: false, message: "Failed to delete alert" }
  }
}

export async function getUserActiveAlerts(): Promise<Alert[]> {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return []
    }

    const docs = await AlertModel.find({ userId: res.session.user.id, status: "active" }).sort({ createdAt: -1 }).lean()

    return docs.map(toAlert)
  } catch (error) {
    console.error("Error fetching active alerts:", error)
    return []
  }
}

export async function getTriggeredAlerts(): Promise<Alert[]> {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return []
    }

    const docs = await AlertModel.find({ userId: res.session.user.id, status: "triggered" }).sort({ triggeredAt: -1 }).lean()

    return docs.map(toAlert)
  } catch (error) {
    console.error("Error fetching triggered alerts:", error)
    return []
  }
}

export async function dismissAlert(alertId: string) {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return { success: false, message: "Not authenticated" }
    }

    const alert = await AlertModel.findOneAndUpdate(
      { _id: alertId, userId: res.session.user.id, status: "triggered" },
      { $set: { status: "dismissed" } },
      { new: true },
    )

    if (!alert) {
      return { success: false, message: "Alert not found" }
    }

    return { success: true, message: "Alert dismissed" }
  } catch (error) {
    console.error("Error dismissing alert:", error)
    return { success: false, message: "Failed to dismiss alert" }
  }
}

export async function dismissAllAlerts() {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return { success: false, message: "Not authenticated" }
    }

    await AlertModel.updateMany({ userId: res.session.user.id, status: "triggered" }, { $set: { status: "dismissed" } })

    return { success: true, message: "All alerts dismissed" }
  } catch (error) {
    console.error("Error dismissing all alerts:", error)
    return { success: false, message: "Failed to dismiss alerts" }
  }
}
