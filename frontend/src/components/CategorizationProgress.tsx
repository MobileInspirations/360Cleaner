import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CategorizationProgressProps {
  taskId: string
  onComplete: () => void
}

interface ProgressData {
  status: 'running' | 'completed' | 'error'
  progress: number
  message?: string
}

function CategorizationProgress({ taskId, onComplete }: CategorizationProgressProps) {
  const [progress, setProgress] = useState<ProgressData>({
    status: 'running',
    progress: 0,
  })

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/contacts/categorize/status/${taskId}`)
        const data = await response.json()

        if (response.ok) {
          setProgress({
            status: data.status,
            progress: data.progress,
            message: data.message,
          })

          if (data.status === 'completed') {
            onComplete()
          } else if (data.status === 'error') {
            toast.error(data.message || 'Categorization failed')
            onComplete()
          }
        }
      } catch (error) {
        toast.error('Failed to check progress')
        onComplete()
      }
    }

    const interval = setInterval(checkProgress, 1000)
    return () => clearInterval(interval)
  }, [taskId, onComplete])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {progress.status === 'running' ? 'Processing...' : progress.message}
        </span>
        <span className="text-sm font-medium">{progress.progress}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  )
}

export default CategorizationProgress 