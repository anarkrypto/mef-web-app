import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DeliberationComment } from "@/types/deliberation"

interface ReviewerCommentsProps {
  comments: DeliberationComment[]
  newComment?: DeliberationComment
}

export function ReviewerComments({ comments, newComment }: ReviewerCommentsProps) {
  // Combine existing comments with new comment if it exists
  const allComments = newComment 
    ? [...comments, newComment]
    : comments

  return (
    <div className="mt-6 space-y-4">
      <h4 className="font-medium">Reviewer Comments</h4>
      <div className="space-y-4">
        {allComments.map((comment) => (
          <div 
            key={comment.id} 
            className={cn(
              "p-4 rounded-lg border",
              comment.recommendation 
                ? "border-green-500/20 bg-green-50/50 dark:bg-green-900/10"
                : "border-red-500/20 bg-red-50/50 dark:bg-red-900/10"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">👤 {comment.reviewer.username}</span>
              <Badge variant={comment.recommendation ? 'default' : 'destructive'}>
                {comment.recommendation ? '✅ Recommended' : '❌ Not Recommended'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{comment.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 