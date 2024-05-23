"use client";

import { useState } from "react";
import Link from "next/link";
import ReactDOMServer from "react-dom/server";

import type { RouterOutputs } from "@acme/api";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import NeedLoginDialog from "../../../../_components/need-login-dialog";

interface PostProps {
  userId?: string;
  post: NonNullable<RouterOutputs["post"]["getPosts"][0]>;
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

export function Post({ post, userId }: PostProps) {
  const utils = api.useUtils();
  const [needLoginFormOpen, setNeedLoginFormOpen] = useState(false);
  const { data: userLikedPost, refetch: refetchUserLikedPost } =
    api.post.userLikedPost.useQuery(
      {
        postUuid: post.uuid,
        userId: userId ?? "",
      },
      {
        enabled: userId != null,
      },
    );

  const { mutateAsync: likePost } = api.post.likePost.useMutation();
  const { mutateAsync: unlikePost } = api.post.unlikePost.useMutation();

  const postContentHighlighted = highlightHashtags(post.content);

  async function handleLikeClick() {
    if (!userId) {
      setNeedLoginFormOpen(true);
      return;
    }
    if (userLikedPost) {
      await unlikePost({
        postUuid: post.uuid,
        userId,
      });
    } else {
      await likePost({
        postUuid: post.uuid,
        userId,
      });
    }
    await refetchUserLikedPost();
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <NeedLoginDialog
        open={needLoginFormOpen}
        setOpen={setNeedLoginFormOpen}
      />
      <div className="flex items-center space-x-4">
        {/* <img
          alt="Avatar do Professor"
          className="h-12 w-12 rounded-full"
          height={48}
          src="/placeholder.svg"
          style={{
            aspectRatio: "48/48",
            objectFit: "cover",
          }}
          width={48}
        /> */}
        <div>
          <h3 className="text-lg font-medium">{post.User.name}</h3>
          <p className="text-gray-500">{post?.School?.name}</p>
        </div>
      </div>
      <p
        dangerouslySetInnerHTML={{ __html: postContentHighlighted }}
        className="mt-4"
      />
      <div className="mt-4 flex items-center space-x-4">
        <LikeButton
          handleLikeClick={handleLikeClick}
          userLiked={userLikedPost}
        />
        <CommentButton post={post} />
      </div>
      {post.Comments.length > 0 && (
        <h3 className="font-semibold">Comentários</h3>
      )}
      <div className="space-y-4 py-4">
        {post.Comments.map((comment) => {
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
                    {new Intl.DateTimeFormat("pt-BR").format(comment.createdAt)}
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
  );
}

function LikeButton({
  handleLikeClick,
  userLiked = false,
}: {
  handleLikeClick: () => void;
  userLiked: boolean | undefined;
}) {
  return (
    <Button size="icon" variant="ghost" onClick={handleLikeClick}>
      <HeartIcon {...(userLiked && { stroke: "red", fill: "red" })} />
      <span className="sr-only">Curtir</span>
    </Button>
  );
}

function CommentButton({
  post,
}: {
  post: RouterOutputs["post"]["getPosts"][0];
}) {
  return (
    <Link href={`?post=${post.id}`}>
      <MessageCircleIcon className="h-5 w-5" />
      <span className="sr-only">Comentar</span>
    </Link>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Icone</title>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Icone</title>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function Share2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Icone</title>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  );
}
