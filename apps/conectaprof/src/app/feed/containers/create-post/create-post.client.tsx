"use client";

import { useRef, useState } from "react";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import NeedLoginDialog from "../../_components/need-login-dialog";
import { HashtagTextarea } from "./_components/post-textarea/post-textarea";

interface CreatePostClientProps {
  userId?: string;
  userName?: string;
}

export function CreatePostClient({ userId, userName }: CreatePostClientProps) {
  const utils = api.useUtils();
  const { mutateAsync: createPost, reset: resetCreatePost } =
    api.post.createPost.useMutation();
  const [text, setText] = useState("");
  const [needLoginFormOpen, setNeedLoginFormOpen] = useState(false);
  const editorKey = useRef(new Date().getTime());
  async function handlePostClick() {
    if (!userId) {
      setNeedLoginFormOpen(true);
      return;
    }
    if (!text.trim()) return;
    await createPost({
      content: text,
      userId,
    });
    setText("");
    await Promise.all([utils.post.getPosts.invalidate(), resetCreatePost()]);
    editorKey.current = new Date().getTime();
  }
  return (
    <>
      <NeedLoginDialog
        open={needLoginFormOpen}
        setOpen={setNeedLoginFormOpen}
      />
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-4 md:grid-cols-12">
        <div className="col-span-12">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium">
              {userName ? `Olá ${userName}` : ""}
            </h2>
            <div className="mt-4">
              <HashtagTextarea
                text={text}
                setText={setText}
                key={editorKey.current}
              />
              <Button
                onClick={handlePostClick}
                className="mt-4 w-full"
                type="submit"
                variant="outline"
              >
                Postar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
