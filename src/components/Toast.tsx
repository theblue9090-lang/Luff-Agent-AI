import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface ToastProps {
  message: string | null
  onDone: () => void
}

export default function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [message, onDone])

  if (!message) return null

  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 px-4">
      <div className="flex items-center gap-2.5 rounded-full border border-luff-red/40 bg-luff-surface/95 px-4 py-2.5 text-sm shadow-glow backdrop-blur-xl">
        <CheckCircle2 className="h-4.5 w-4.5 text-luff-red" />
        {message}
      </div>
    </div>
  )
}
