import { Group } from "@/db/models/group"
import { GroupMember } from "@/db/models/groupMember"
import { connectToDatabase } from "@/db/mongoose"
import { getStockMetrics } from "@/lib/actions/finnhub.actions"
import { NextResponse } from "next/server"
import { Types } from "mongoose"

type RouteParams = {
  params: { groupId: string }
}

async function calculateTodayGain(positions: Array<{ symbol: string; amountInvested: number }>): Promise<number> {
  if (positions.length === 0) return 0

  const symbols = positions.map((p) => p.symbol)
  const { quotes } = await getStockMetrics(symbols)

  let totalGain = 0

  for (const position of positions) {
    const quote = quotes[position.symbol]
    if (!quote || quote.c === undefined || quote.dp === undefined) {
      continue // Skip if we don't have quote data
    }

    const currentPrice = quote.c
    const changePercent = quote.dp // Daily percent change (e.g., 5.0 means +5%)

    // Calculate previous close price
    // dp = ((currentPrice - previousClose) / previousClose) * 100
    // So: previousClose = currentPrice / (1 + dp/100)
    const previousClose = currentPrice / (1 + changePercent / 100)

    // Estimate number of shares based on amount invested at previous close
    // This assumes the position value was approximately amountInvested at previous close
    const estimatedShares = position.amountInvested / previousClose

    // Today's gain = (currentPrice - previousClose) * shares
    const todayGain = (currentPrice - previousClose) * estimatedShares
    totalGain += todayGain
  }

  return parseFloat(totalGain.toFixed(2))
}

export async function GET(_request: Request, { params }: RouteParams) {
  const groupId = params.groupId

  if (!Types.ObjectId.isValid(groupId)) {
    return NextResponse.json({ error: "Invalid group id" }, { status: 400 })
  }

  try {
    await connectToDatabase()

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const members = await GroupMember.find({ groupId: group._id }).lean()

    // Calculate today's gain for each member
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const todayGain = await calculateTodayGain(member.positions || [])
        const totalInvested = (member.positions || []).reduce(
          (sum: number, pos: { symbol: string; amountInvested: number }) => sum + pos.amountInvested,
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

    // Sort by today's gain (descending)
    enrichedMembers.sort((a, b) => b.todayGain - a.todayGain)

    return NextResponse.json({ members: enrichedMembers }, { status: 200 })
  } catch (error) {
    console.error("Error fetching group members:", error)
    return NextResponse.json({ error: "Failed to fetch group members" }, { status: 500 })
  }
}
