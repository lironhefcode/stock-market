import { Group } from "@/db/models/group"
import { GroupMember, StockPosition } from "@/db/models/groupMember"
import { connectToDatabase } from "@/db/mongoose"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

function validatePositions(positions: unknown): { valid: boolean; data?: StockPosition[]; error?: string } {
  if (!Array.isArray(positions) || positions.length === 0) {
    return { valid: false, error: "At least one stock position is required" }
  }

  const validated: StockPosition[] = []
  for (const pos of positions) {
    if (!pos || typeof pos !== "object") {
      return { valid: false, error: "Invalid position format" }
    }

    const symbol = typeof pos.symbol === "string" ? pos.symbol.trim().toUpperCase() : ""
    const amountInvested = Number(pos.amountInvested)

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

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const inviteCode = typeof body?.inviteCode === "string" ? body.inviteCode.trim().toUpperCase() : ""

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    const positionsValidation = validatePositions(body?.positions)
    if (!positionsValidation.valid) {
      return NextResponse.json({ error: positionsValidation.error }, { status: 400 })
    }

    await connectToDatabase()

    const group = await Group.findOne({ inviteCode })
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const existingMember = await GroupMember.findOne({
      groupId: group._id,
      userId: session.user.id,
    })

    if (existingMember) {
      return NextResponse.json({ error: "You already joined this group" }, { status: 409 })
    }

    await GroupMember.create({
      groupId: group._id,
      userId: session.user.id,
      username: session.user.name || session.user.email || "Anonymous",
      positions: positionsValidation.data!,
      joinedAt: new Date(),
    })

    return NextResponse.json(
      {
        groupId: group._id.toString(),
        message: "Joined group successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error joining group:", error)
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 })
  }
}
