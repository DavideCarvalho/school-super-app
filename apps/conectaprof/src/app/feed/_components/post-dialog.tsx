"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { RouterOutputs } from "@acme/api";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { api } from "~/trpc/react";
import { HashtagTextarea } from "./post-textarea";

interface PostDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  postId: string;
}

export function PostDialog({ open, setOpen, postId }: PostDialogProps) {
  const [addNewComment, setAddNewComment] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const { data: post, refetch: refetchPost } = api.post.getPostById.useQuery({
    postId,
  });
  const { mutateAsync: addCommentMutation, reset: resetCommentMutation } =
    api.post.addComment.useMutation();
  const { mutateAsync: likeCommentMutation } =
    api.post.likeComment.useMutation();
  const { mutateAsync: unlikeCommentMutation } =
    api.post.unlikeComment.useMutation();

  async function handleAddComment() {
    if (!post) return;
    await addCommentMutation({
      postId: post.id,
      comment: commentText,
      userId: post.User.id,
    });
    await Promise.all([refetchPost(), resetCommentMutation()]);
    refetchPost();
    setAddNewComment(false);
    setCommentText("");
  }

  const postContentHighlighted = highlightHashtags(post?.content ?? "");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>The Joke Tax Chronicles</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div>By Jared Palmer</div>
              <div>•</div>
              <div>May 21, 2024</div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-gray dark:prose-invert mx-auto">
          <p dangerouslySetInnerHTML={{ __html: postContentHighlighted }} />
        </div>

        <DialogFooter>
          <div className="w-full border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="space-y-4 py-4">
              {!addNewComment && (
                <Button
                  onClick={() => setAddNewComment(true)}
                  variant="outline"
                  size="sm"
                >
                  Comentar
                </Button>
              )}
              {addNewComment && (
                <div className="flex items-start gap-4">
                  <HashtagTextarea
                    text={commentText}
                    setText={setCommentText}
                  />
                  <Button
                    onClick={() => {
                      handleAddComment();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Enviar
                  </Button>
                  <Button
                    onClick={() => {
                      setAddNewComment(false);
                      setCommentText("");
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
            <h3 className="font-semibold">Comentários</h3>
            <div className="space-y-4 py-4">
              {post?.Comments?.map((comment) => {
                const commentContentHighlighted = highlightHashtags(
                  comment.comment ?? "",
                );
                return (
                  <div key={comment.id} className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage alt="@shadcn" src="/placeholder-user.jpg" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{comment.User.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.DateTimeFormat("pt-BR").format(
                            comment.createdAt,
                          )}
                        </div>
                      </div>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: commentContentHighlighted,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const highlightHashtags = (text: string): string => {
  const parts = text.split(/(\s+)/);
  return parts
    .map((part) => {
      if (part.startsWith("#")) {
        const renderedToString = ReactDOMServer.renderToString(
          <HighLightedText key={part} content={part} />,
        );
        return renderedToString;
      }
      if (part.match(/\n+/)) {
        return part.replace(/\n/g, "<br/>"); // Manter as quebras de linha na saída HTML
      }
      return part;
    })
    .join(" ");
};

function HighLightedText({ content }: { content: string }) {
  const [, text] = content.split("#");
  return (
    <Link href={`/tags/${text}`} className="text-blue-500">
      {content}
    </Link>
  );
}
