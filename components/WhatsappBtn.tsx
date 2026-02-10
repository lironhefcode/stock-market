"use client"
import { WhatsappIcon, WhatsappShareButton } from "react-share"

function WhatsappBtn({ inviteCode }: { inviteCode: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const url = `${appUrl}/groups/code?inviteCode=${inviteCode}`
  return (
    <WhatsappShareButton
      title={`hey Join my group 
groupCode: ${inviteCode}`}
      url={url}
      separator={`\n`}
    >
      <WhatsappIcon className="rounded-full" size={24} />
    </WhatsappShareButton>
  )
}

export default WhatsappBtn
