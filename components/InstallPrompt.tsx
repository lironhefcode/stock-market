"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("Service worker registration failed:", error)
      })
    }

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setDismissed(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === "accepted") {
      setDismissed(true)
    }

    setDeferredPrompt(null)
  }

  if (!deferredPrompt || dismissed) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-70 sm:hidden">
      <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-yellow-400/20 bg-gray-800/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-gray-900">
            <Download className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Install CoVest</p>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              Add the app to your home screen for faster access and real-time stock alerts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-700 hover:text-gray-300"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button type="button" onClick={handleInstall} className="yellow-btn mt-4 h-11 w-full rounded-2xl">
          Install app
        </button>
      </div>
    </div>
  )
}
