import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { serverSideHelpers, trpCaller } from "@acme/api";
import { prisma } from "@acme/db";

import { SchoolCanteenSellsTable } from "~/components/school-canteen-sells-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";
import { getUserPublicMetadata } from "~/utils/get-user-public-metadata";

export default function CanteensPage({
  school,
  canteenId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolCanteenSellsTable canteenId={canteenId} schoolId={school.id} />
    </SchoolLayout>
  );
}

export const getServerSideProps = wrapGetServerSidePropsWithSentry(
  async ({ req, params, query }: GetServerSidePropsContext) => {
    // console.log("getServerSideProps no VendasCantina");
    // const schoolSlug = params?.["school-slug"] as string;
    // const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    // if (!school) {
    //   // TODO: Redirect to 404 page
    //   throw new Error(`School with slug ${schoolSlug} not found`);
    // }
    // const page = query?.page ? Number(query.page) : 1;
    // const limit = query?.limit ? Number(query.limit) : 5;
    // const clerkUser = getAuth(req);
    // if (!clerkUser.userId) {
    //   // Redirect to sign in page
    //   return {
    //     redirect: {
    //       destination: `/sign-in?redirectTo=/escola/${schoolSlug}/vendas-cantina?page=${page}&limit=${limit}`,
    //       permanent: false,
    //     },
    //   };
    // }
    // const canteen = await prisma.canteen.findFirst({
    //   where: {
    //     schoolId: school.id,
    //   },
    // });
    // // if (!canteen) {
    // //   return {
    // //     redirect: {
    // //       destination: `/escola/${schoolSlug}`,
    // //       permanent: true,
    // //     },
    // //   };
    // // }
    // await Promise.all([
    //   serverSideHelpers.canteen.allCanteenSells.prefetch({
    //     canteenId: canteen.id,
    //     page,
    //     limit,
    //   }),
    //   serverSideHelpers.canteen.countAllCanteenSells.prefetch({
    //     canteenId: canteen.id,
    //   }),
    // ]);
    // return {
    //   props: {
    //     school,
    //     canteenId: canteen.id,
    //     trpcState: serverSideHelpers.dehydrate(),
    //   },
    // };
  },
  "/escola/[school-slug]/vendas-cantina",
);
