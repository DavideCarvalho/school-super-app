"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { RouterOutputs } from "@acme/api";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { api } from "~/trpc/react";

interface PostDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  postId: string;
}

export function PostDialog({ open, setOpen, postId }: PostDialogProps) {
  const { data: post, refetch: refetchPost } = api.post.getPostById.useQuery({
    postId,
  });

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
          <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
            <h3 className="font-semibold">Comentários</h3>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage alt="@shadcn" src="/placeholder-user.jpg" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">@iamwillpursell</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      5 months ago
                    </div>
                  </div>
                  <p>
                    I really love the ecosystem Vercel is creating. The way each
                    component can be added and modified with ease really makes
                    these tools attractive.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage alt="@shadcn" src="/placeholder-user.jpg" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">@HackSoft</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      2 months ago
                    </div>
                  </div>
                  <p>
                    We are more than excited to leverage all the new stuff,
                    building better products for our clients ✨
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage alt="@shadcn" src="/placeholder-user.jpg" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">@greed7513</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      6 days ago
                    </div>
                  </div>
                  <p>
                    does anyone know which monospace are they using when showing
                    code?
                  </p>
                </div>
              </div>
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
