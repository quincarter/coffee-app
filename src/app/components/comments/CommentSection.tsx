"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useFeatureFlag } from "@/app/hooks/useFeatureFlag";
import UserAvatar from "@/app/components/UserAvatar";
import { Comment, CommentLike, User } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import { LikeIcon, EditIcon, TrashIcon, ReplyIcon } from "../icons";

interface CommentWithUserAndReplies extends Comment {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  replies: CommentWithUserAndReplies[];
  likes: CommentLike[];
  _count?: {
    likes: number;
  };
}

interface CommentSectionProps {
  entityId: string;
  entityType: "coffee" | "brewProfile" | "roaster";
  comments?: CommentWithUserAndReplies[];
}

function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  currentUserId,
  level = 0,
}: {
  comment: CommentWithUserAndReplies;
  onReply: (parentId: string, replyContent: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  currentUserId: string;
  level?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  const isOwnComment = comment.user.id === currentUserId;
  const likes = comment.likes || [];
  const hasLiked = likes.some((like) => like.userId === currentUserId);
  const likeCount = likes.length;

  const handleEdit = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleReply = () => {
    onReply(comment.id, replyContent);
    setIsReplying(false);
    setReplyContent("");
  };

  return (
    <div className={`flex items-start space-x-4 ${level > 0 ? "ml-12" : ""}`}>
      <div className="flex-grow">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <UserAvatar user={comment.user} />

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.isEdited && " (edited)"}
              </span>
              {isOwnComment && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-ghost btn-xs"
                    aria-label="Edit comment"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="btn btn-ghost btn-xs text-error"
                    aria-label="Delete comment"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Edit your comment... (Markdown supported)"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button onClick={handleEdit} className="btn btn-primary btn-sm">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 prose prose-sm max-w-none">
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>
          )}
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`btn btn-ghost btn-xs gap-1 ${
                hasLiked ? "text-primary" : ""
              }`}
              aria-label={hasLiked ? "Unlike comment" : "Like comment"}
            >
              <LikeIcon
                className={`w-4 h-4 ${hasLiked ? "fill-primary" : ""}`}
              />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="btn btn-ghost btn-xs gap-1"
              aria-label="Reply to comment"
            >
              <ReplyIcon className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {isReplying && (
          <div className="mt-4 ml-8">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="Write a reply... (Markdown supported)"
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => setIsReplying(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="btn btn-primary btn-sm"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {comment?.replies?.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                currentUserId={currentUserId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({
  entityId,
  entityType,
  comments: initialComments = [],
}: CommentSectionProps) {
  const { session } = useAuth();
  const { isEnabled, isLoading, wrapComponent } = useFeatureFlag(
    "comments-section",
    session
  );
  // Ensure all comments have a replies array and proper like structure
  const normalizedComments = initialComments.map((comment) => ({
    ...comment,
    replies: (comment.replies || []).map((reply) => ({
      ...reply,
      likes: reply.likes || [],
      _count: reply._count || { likes: 0 },
    })),
    likes: comment.likes || [],
    _count: comment._count || { likes: 0 },
  }));
  const [comments, setComments] = useState(normalizedComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't render anything if the feature is disabled or loading
  if (isLoading) return null;
  if (!isEnabled) return null;
  if (!session?.user) {
    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">Please sign in to join the discussion.</p>
      </div>
    );
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          entityId,
          entityType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const comment = await response.json();
      // Normalize new comment structure
      const normalizedComment = {
        ...comment,
        replies: comment.replies || [],
        likes: comment.likes || [],
        _count: comment._count || { likes: 0 },
      };
      setComments((prev) => [normalizedComment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          entityId,
          entityType,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      const reply = await response.json();
      // Normalize new reply structure
      const normalizedReply = {
        ...reply,
        replies: reply.replies || [],
        likes: reply.likes || [],
        _count: reply._count || { likes: 0 },
      };
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [normalizedReply, ...comment.replies] }
            : comment
        )
      );
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const updatedComment = await response.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, ...updatedComment }
            : {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId
                    ? { ...reply, ...updatedComment }
                    : reply
                ),
              }
        )
      );
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment.id !== commentId &&
            comment.replies.every((reply) => reply.id !== commentId)
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to like comment");
      }

      const { liked, count, likes } = await response.json();

      setComments((prev) =>
        prev.map((comment) => {
          // If this is the comment being liked
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: likes,
              _count: { likes: count },
            };
          }

          // Check if the liked comment is in the replies
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: likes,
                  _count: { likes: count },
                };
              }
              return reply;
            }),
          };
        })
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return wrapComponent(
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Comments</h3>

      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className="flex items-start space-x-4">
          <UserAvatar user={session.user} className="w-20 h-20 flex-col" />
          <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment... (Markdown supported)"
              className="textarea textarea-bordered w-full"
              rows={3}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm opacity-70">Markdown supported</p>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="btn btn-primary"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLike={handleLike}
            currentUserId={session.user.id}
          />
        ))}
      </div>
    </div>
  );
}
