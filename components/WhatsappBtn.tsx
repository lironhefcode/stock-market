"use client"
import { WhatsappIcon, WhatsappShareButton } from "react-share"

function WhatsappBtn({ inviteCode }: { inviteCode: string }) {
  return (
    <WhatsappShareButton
      title={`Join my group 
    groupCode: ${inviteCode}
    `}
      url={`${process.env.NEXT_PUBLIC_APP_URL}`}
      separator=" - "
    >
      <WhatsappIcon className="rounded-full" size={24} />
    </WhatsappShareButton>
  )
}

export default WhatsappBtn
