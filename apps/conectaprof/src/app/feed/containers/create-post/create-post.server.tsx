import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { CreatePostClient } from "./create-post.client";

interface CreatePostServerProps {
  School?: {
    id: string;
    name: string;
  };
  userId?: string;
  userName?: string;
}

export async function CreatePostServer(props: CreatePostServerProps) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <CreatePostDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function CreatePostDataLoader(props: CreatePostServerProps) {
  return <CreatePostClient {...props} />;
}
