import { Loader2 } from 'lucide-react'

interface ConnectingSpinnerProps {
  message: string
}

export function ConnectingSpinner({ message }: ConnectingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
