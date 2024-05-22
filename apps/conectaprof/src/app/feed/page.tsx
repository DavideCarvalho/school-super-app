"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Button } from "@acme/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@acme/ui/sheet";

import { api } from "~/trpc/react";
import NeedLoginDialog from "./_components/need-login-dialog";
import { Post } from "./_components/post";
import { PostDialog } from "./_components/post-dialog";
import { HashtagTextarea } from "./_components/post-textarea";

export default function FeedPage() {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [needLoginFormOpen, setNeedLoginFormOpen] = useState(false);

  const { data: posts, refetch: refetchPosts } = api.post.getPosts.useQuery(
    {
      page: 1,
      limit: 5,
    },
    {
      initialData: [],
    },
  );

  const { mutateAsync: createPost, reset: resetCreatePost } =
    api.post.createPost.useMutation();

  async function handlePostClick() {
    if (!user?.id) {
      console.log("to aqui");
      setNeedLoginFormOpen(true);
      return;
    }
    if (!text.trim()) return;
    await createPost({
      content: text,
      userId: user.id,
    });
    setText("");
    await resetCreatePost();
    await refetchPosts();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-orange-600 py-4 text-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-4">
          <h1 className="text-2xl font-bold">ConectaProf</h1>
          <nav className="mt-4 flex items-center space-x-4 lg:mt-0 lg:flex">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="lg:hidden" size="icon" variant="outline">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Abrir menu de navegação</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-2 py-6">
                  <Link
                    className="flex w-full items-center py-2 text-lg font-semibold"
                    href="#"
                  >
                    Início
                  </Link>
                  <Link
                    className="flex w-full items-center py-2 text-lg font-semibold"
                    href="#"
                  >
                    Explorar
                  </Link>
                  <Link
                    className="flex w-full items-center py-2 text-lg font-semibold"
                    href="#"
                  >
                    Mensagens
                  </Link>
                  <Link
                    className="flex w-full items-center py-2 text-lg font-semibold"
                    href="#"
                  >
                    Perfil
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-100 py-8">
        <NeedLoginDialog
          open={needLoginFormOpen}
          setOpen={setNeedLoginFormOpen}
        />
        <Suspense>
          <PostDialogListener />
        </Suspense>
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-12">
          <div className="col-span-12">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium">Pesquisar</h2>
              <div className="mt-4">
                <HashtagTextarea text={text} setText={setText} />
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
          <div className="col-span-8">
            <div className="space-y-6">
              {posts.map((item) => (
                <Post post={item} key={item.id} userId={user?.id} />
              ))}
            </div>
          </div>
          <div className="col-span-4 space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium">Tópicos em Alta</h2>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    className="text-gray-500 hover:text-orange-600"
                    href="#"
                  >
                    #edtech
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 hover:text-orange-600"
                    href="#"
                  >
                    #ensino
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 hover:text-orange-600"
                    href="#"
                  >
                    #sala de aula
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 hover:text-orange-600"
                    href="#"
                  >
                    #desenvolvimento profissional
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PostDialogListener() {
  const [postId, setPostId] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(searchParams.has("post"));
  useEffect(() => {
    if (searchParams.has("post")) {
      setOpen(true);
      setPostId(searchParams.get("post") as string);
    } else {
      setOpen(false);
      setPostId("");
    }
  }, [searchParams]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("post");
      router.push(`${pathname}?${params.toString()}`);
    }
  }

  return <PostDialog open={open} setOpen={handleOpenChange} postId={postId} />;
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
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
