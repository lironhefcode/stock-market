import GroupMemberRow from "./GroupMemberRow"

function LeaderBoard({ members }: { members: GroupMemberRow[] }) {
  return (
    <div>
      <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-700 text-xs font-mono text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Trader</div>
          <div className="col-span-3 text-right">Daily P&L</div>
          <div className="col-span-2 text-right">Capital</div>
          <div className="col-span-2 text-right">Positions</div>
        </div>

        {members.map((member, i) => {
          const rank = i + 1

          return <GroupMemberRow key={member.userId} member={member} rank={rank} />
        })}
      </div>
    </div>
  )
}

export default LeaderBoard
