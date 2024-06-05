import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { serverSideHelpers, trpCaller } from "@acme/api";
import { prisma } from "@acme/db";

import { SchoolCanteenItemsTable } from "~/components/school-canteen-items-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";
import { getUserPublicMetadata } from "~/utils/get-user-public-metadata";

export default function CanteensPage({
  school,
  canteenId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolCanteenItemsTable canteenId={canteenId} schoolId={school.id} />
    </SchoolLayout>
  );
}

export const getServerSideProps = wrapGetServerSidePropsWithSentry(
  async ({ req, params, query }: GetServerSidePropsContext) => {
    const schoolSlug = params?.["school-slug"] as string;
    const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    if (!school) {
      // TODO: Redirect to 404 page
      throw new Error(`School with slug ${schoolSlug} not found`);
    }

    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 5;

    const clerkUser = getAuth(req);

    if (!clerkUser.userId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/itens-cantina?page=${page}&limit=${limit}`,
          permanent: false,
        },
      };
    }

    const user = await clerkClient.users.getUser(clerkUser.userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/cantinas?page=${page}&limit=${limit}`,
          permanent: false,
        },
      };
    }

    const userOnMyDb = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      include: {
        Role: true,
      },
    });

    // const allowedRoles = ["DIRECTOR", "CANTEEN_WORKER"];

    // if (!userOnMyDb || !allowedRoles.includes(userOnMyDb.Role.name)) {
    //   // Redirect to sign in page
    //   return {
    //     redirect: {
    //       destination: `/escola/${schoolSlug}?page=1&limit=5`,
    //       permanent: true,
    //     },
    //   };
    // }

    const canteenId = getUserPublicMetadata(user).canteen?.id;

    if (!canteenId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/escola/${schoolSlug}?page=1&limit=5`,
          permanent: true,
        },
      };
    }

    await Promise.all([
      serverSideHelpers.canteen.allCanteenItems.prefetch({
        canteenId,
        page,
        limit,
      }),
      serverSideHelpers.canteen.countAllCanteenItems.prefetch({
        canteenId,
      }),
    ]);

    return {
      props: {
        school,
        canteenId,
        trpcState: serverSideHelpers.dehydrate(),
      },
    };
  },
  "/escola/[school-slug]/itens-cantina",
);
