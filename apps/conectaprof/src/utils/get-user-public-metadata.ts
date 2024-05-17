import type { User } from "@clerk/clerk-sdk-node";
import type { UserResource } from "@clerk/types";

export function getUserPublicMetadata(user: User | UserResource) {
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
