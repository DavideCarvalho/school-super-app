import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { api } from "~/trpc/server";
import { FeedClient } from "./feed.client";

interface FeedServerProps {
  School?: {
    id: string;
    name: string;
  };
  userId?: string;
}

export async function FeedServer(props: FeedServerProps) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <FeedDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function FeedDataLoader(props: FeedServerProps) {
  const posts = await api.post.getPosts({});
  return <FeedClient {...props} initialData={{ posts }} />;
}
