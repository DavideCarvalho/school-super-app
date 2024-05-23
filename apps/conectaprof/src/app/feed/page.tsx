import { currentUser } from "@clerk/nextjs/server";

import { CreatePostServer } from "./containers/create-post/create-post.server";
import { FeedServer } from "./containers/feed/feed.server";

export default async function FeedPage() {
  const user = await currentUser();
  const userId = user?.publicMetadata?.id as unknown as string | undefined;
  const userName = user?.publicMetadata?.name as unknown as string | undefined;
  const userSchool = user?.publicMetadata?.School as unknown as {
    id: string;
    name: string;
  };

  return (
    <>
      <CreatePostServer
        userId={userId}
        School={userSchool}
        userName={userName}
      />
      <FeedServer userId={userId} School={userSchool} />
    </>
  );
}
