"use client";

import { Suspense, use, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/trpc/react";
import NeedLoginDialog from "../../_components/need-login-dialog";
import { PostDialog } from "./_components/post-dialog/post-dialog";
import { Post } from "./_components/post/post";

interface FeedClientProps {
  userId?: string;
  initialData: {
    posts?:
      | Promise<RouterOutputs["post"]["getPosts"]>
      | RouterOutputs["post"]["getPosts"];
  };
}

export function FeedClient({ userId, initialData }: FeedClientProps) {
  const [needLoginFormOpen, setNeedLoginFormOpen] = useState(false);

  const utils = api.useUtils();
  const [posts] = api.post.getPosts.useSuspenseQuery(
    {},
    {
      initialData: initialData?.posts
        ? initialData.posts instanceof Promise
          ? use(initialData.posts)
          : initialData.posts
        : [],
    },
  );

  return (
    <>
      <NeedLoginDialog
        open={needLoginFormOpen}
        setOpen={setNeedLoginFormOpen}
      />
      <Suspense>
        <PostDialogListener />
      </Suspense>
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-4 md:grid-cols-12">
        <div className="col-span-12">
          <div className="space-y-6">
            {posts.map((item) => (
              <Post post={item} key={item.id} userId={userId} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface PostDialogListenerProps {
  userId?: string;
}

function PostDialogListener({ userId }: PostDialogListenerProps) {
  const [postUuid, setPostUuid] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(searchParams.has("post"));
  useEffect(() => {
    if (searchParams.has("post")) {
      setOpen(true);
      setPostUuid(searchParams.get("post") as string);
    } else {
      setOpen(false);
      setPostUuid("");
    }
  }, [searchParams]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("post");
      router.push(`${pathname}?${params.toString()}`);
    }
  }

  return (
    <PostDialog
      open={open}
      setOpen={handleOpenChange}
      postUuid={postUuid}
      userId={userId}
    />
  );
}
