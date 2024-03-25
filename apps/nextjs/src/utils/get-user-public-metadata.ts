import type { User } from "@clerk/clerk-sdk-node";

export function getUserPublicMetadata(user: User) {
  return user.publicMetadata as {
    id: string;
    role: string;
    school: {
      id: string;
      name: string;
      slug: string;
    };
    canteen?: {
      id: string;
    };
  };
}
