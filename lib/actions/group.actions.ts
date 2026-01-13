"use server"

import crypto from "crypto"
import { headers } from "next/headers"
import { Types } from "mongoose"

import { Group } from "@/db/models/group"
import { GroupMember, StockPosition } from "@/db/models/groupMember"
import { connectToDatabase } from "@/db/mongoose"
import { auth } from "@/lib/better-auth/auth"
import { getStockMetrics } from "@/lib/actions/finnhub.actions"

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

const generateInviteCode = async () => {
  let attempts = 0
  while (attempts < 10) {
    const code = crypto.randomBytes(4).toString("hex").slice(0, 8).toUpperCase()
    const existing = await Group.findOne({ inviteCode: code })
    if (!existing) return code
    attempts += 1
  }
  throw new Error("Unable to generate unique invite code")
}

const validatePositions = (positions: unknown): { valid: boolean; data?: StockPosition[]; error?: string } => {
  if (!Array.isArray(positions) || positions.length === 0) {
    return { valid: false, error: "At least one stock position is required" }
  }

  const validated: StockPosition[] = []
  for (const pos of positions) {
    if (!pos || typeof pos !== "object") {
      return { valid: false, error: "Invalid position format" }
    }

    const symbol = typeof (pos as any).symbol === "string" ? (pos as any).symbol.trim().toUpperCase() : ""
    const amountInvested = Number((pos as any).amountInvested)

    if (!symbol) {
      return { valid: false, error: "Stock symbol is required for all positions" }
    }

    if (!Number.isFinite(amountInvested) || amountInvested <= 0) {
      return { valid: false, error: `Invalid amount invested for ${symbol}. Must be a positive number.` }
    }

    validated.push({
      symbol,
      amountInvested: parseFloat(amountInvested.toFixed(2)),
    })
  }

  return { valid: true, data: validated }
}

const calculateTodayGain = async (positions: StockPosition[]): Promise<number> => {
  if (!positions.length) return 0

  const symbols = positions.map((p) => p.symbol)
  const { quotes } = await getStockMetrics(symbols)

  let totalGain = 0
  for (const position of positions) {
    const quote = quotes[position.symbol]
    if (!quote || quote.c === undefined || quote.dp === undefined) continue

    const currentPrice = quote.c
    const changePercent = quote.dp
    const previousClose = currentPrice / (1 + changePercent / 100)
    const estimatedShares = position.amountInvested / previousClose
    const todayGain = (currentPrice - previousClose) * estimatedShares
    totalGain += todayGain
  }

  return parseFloat(totalGain.toFixed(2))
}

export const createGroup = async (payload: CreateGroupPayload): Promise<ActionResult<GroupResponse>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const trimmedName = payload?.name?.trim()
    if (!trimmedName) {
      return { success: false, error: "Group name is required" }
    }

    const positionsValidation = validatePositions(payload?.positions)
    if (!positionsValidation.valid) {
      return { success: false, error: positionsValidation.error || "Invalid positions" }
    }

    await connectToDatabase()
    const inviteCode = await generateInviteCode()

    const group = await Group.create({
      name: trimmedName,
      inviteCode,
      creatorId: session.user.id,
      createdAt: new Date(),
    })

    await GroupMember.create({
      groupId: group._id,
      userId: session.user.id,
      username: session.user.name || session.user.email || "Anonymous",
      positions: positionsValidation.data!,
      joinedAt: new Date(),
    })

    return {
      success: true,
      data: {
        groupId: group._id.toString(),
        inviteCode: group.inviteCode,
        name: group.name,
      },
    }
  } catch (error) {
    console.error("createGroup error:", error)
    return { success: false, error: "Unable to create group" }
  }
}

export const joinGroupWithSnapshot = async (
  payload: JoinGroupPayload
): Promise<ActionResult<{ groupId: string; message?: string }>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const inviteCode = typeof payload?.inviteCode === "string" ? payload.inviteCode.trim().toUpperCase() : ""
    if (!inviteCode) {
      return { success: false, error: "Invite code is required" }
    }

    const positionsValidation = validatePositions(payload?.positions)
    if (!positionsValidation.valid) {
      return { success: false, error: positionsValidation.error || "Invalid positions" }
    }

    await connectToDatabase()

    const group = await Group.findOne({ inviteCode })
    if (!group) {
      return { success: false, error: "Group not found" }
    }

    const existingMember = await GroupMember.findOne({
      groupId: group._id,
      userId: session.user.id,
    })
    if (existingMember) {
      return { success: false, error: "You already joined this group" }
    }

    await GroupMember.create({
      groupId: group._id,
      userId: session.user.id,
      username: session.user.name || session.user.email || "Anonymous",
      positions: positionsValidation.data!,
      joinedAt: new Date(),
    })

    return { success: true, data: { groupId: group._id.toString(), message: "Joined group successfully" } }
  } catch (error) {
    console.error("joinGroupWithSnapshot error:", error)
    return { success: false, error: "Unable to join group" }
  }
}

export const getGroupMembers = async (groupId: string): Promise<ActionResult<GroupMembersResponse>> => {
  try {
    if (!Types.ObjectId.isValid(groupId)) {
      return { success: false, error: "Invalid group id" }
    }

    await connectToDatabase()

    const group = await Group.findById(groupId)
    if (!group) {
      return { success: false, error: "Group not found" }
    }

    const members = await GroupMember.find({ groupId: group._id }).lean()

    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const todayGain = await calculateTodayGain(member.positions || [])
        const totalInvested = (member.positions || []).reduce(
          (sum: number, pos: StockPosition) => sum + pos.amountInvested,
          0
        )

        return {
          id: member._id?.toString(),
          groupId: member.groupId.toString(),
          userId: member.userId,
          username: member.username,
          positions: member.positions || [],
          totalInvested,
          todayGain,
          joinedAt: member.joinedAt,
        }
      })
    )

    enrichedMembers.sort((a, b) => b.todayGain - a.todayGain)

    return { success: true, data: { members: enrichedMembers } }
  } catch (error) {
    console.error("getGroupMembers error:", error)
    return { success: false, error: "Unable to fetch members" }
  }
}
