"use client"

import { useCallback, useEffect, useState } from "react"
import { BellRing, X } from "lucide-react"
import { savePushSubscription } from "@/lib/actions/push.actions"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const supported = "Notification" in window && "PushManager" in window && "serviceWorker" in navigator
    setIsSupported(supported)
    setPermission(supported ? Notification.permission : "denied")
    setMounted(true)

    if (!supported) return

    const checkExistingSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()
        setIsSubscribed(!!sub)
      } catch {
        // ignore
      }
    }

    void checkExistingSubscription()
  }, [])

  const enableNotifications = useCallback(async () => {
    if (!isSupported || loading) return
    setLoading(true)

    try {
      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)
      if (nextPermission !== "granted") {
        setLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      let sub = await registration.pushManager.getSubscription()

      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      }

      const serialized = sub.toJSON()
      await savePushSubscription({
        endpoint: serialized.endpoint!,
        keys: {
          p256dh: serialized.keys!.p256dh!,
          auth: serialized.keys!.auth!,
        },
      })

      setIsSubscribed(true)
    } catch (error) {
      console.error("Failed to enable push notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [isSupported, loading])

  useEffect(() => {
    if (mounted && isSupported && permission === "granted" && !isSubscribed && !loading) {
      void enableNotifications()
    }
  }, [mounted, isSupported, permission, isSubscribed, loading, enableNotifications])

  if (!mounted || !isSupported || dismissed) return null

  if (isSubscribed || permission === "denied" || permission === "granted") return null

  return (
    <div className="fixed inset-x-4 bottom-24 z-65 sm:left-auto sm:right-4 sm:bottom-4 sm:w-full sm:max-w-sm">
      <div className="rounded-3xl border border-teal-400/20 bg-gray-800/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-400 text-gray-900">
            <BellRing className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Enable alert notifications</p>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              Get notified instantly when your stock price alerts trigger -- even when the app is closed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-700 hover:text-gray-300"
            aria-label="Dismiss notification prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={enableNotifications}
          disabled={loading}
          className="mt-4 h-11 w-full rounded-2xl bg-teal-400 font-semibold text-gray-900 transition hover:bg-teal-400/90 disabled:opacity-50"
        >
          {loading ? "Enabling..." : "Enable notifications"}
        </button>
      </div>
    </div>
  )
}
