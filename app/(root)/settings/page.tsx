import SettingsForm from "@/components/SettingsForm"
import { getUser } from "@/lib/actions/auth.actions"

export const dynamic = "force-dynamic"

const SettingsPage = async () => {
  const user = await getUser()

  return (
    <div className="relative pb-16">
      <div className="border-b border-gray-700 pb-8 mb-10">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">Account</p>
        <h1 className="text-5xl md:text-7xl font-black text-gray-400 tracking-tighter leading-none mb-4">Settings</h1>
        <p className="text-lg text-gray-500 max-w-2xl">Manage your profile, preferences, and notification settings.</p>
      </div>

      <SettingsForm user={user} />
    </div>
  )
}

export default SettingsPage
