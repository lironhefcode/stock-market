"use client"
import { WhatsappIcon, WhatsappShareButton } from "react-share"

function WhatsappBtn({ inviteCode }: { inviteCode: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const url = `${baseUrl}/groups?inviteCode=${inviteCode}`
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
