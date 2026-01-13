import { Group } from "@/db/models/group"
import { connectToDatabase } from "@/db/mongoose"
import { auth } from "@/lib/better-auth/auth"
import crypto from "crypto"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

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

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""

    if (!name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    await connectToDatabase()

    const inviteCode = await generateInviteCode()

    const group = await Group.create({
      name,
      inviteCode,
      creatorId: session.user.id,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        groupId: group._id.toString(),
        inviteCode: group.inviteCode,
        name: group.name,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}
