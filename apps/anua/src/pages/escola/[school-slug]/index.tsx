import type { GetServerSidePropsContext } from "next";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";
import { LineChart } from "@tremor/react";

import type { Canteen, Role, User } from "@acme/db";
import { serverSideHelpers, trpCaller } from "@acme/api";
import { prisma } from "@acme/db";

import { CanteenSellsQuantityByMonthChart } from "~/components/canteen-sells-quantity-by-month-chart";
import { CanteenSellsValueByMonthChart } from "~/components/canteen-sells-value-by-month-chart";
import { CustomChartTooltip } from "~/components/custom-chart-tooltip";
import { PurchaseRequestsByMonthChart } from "~/components/purchaserequests-by-month-chart";
import { SchoolLayout } from "~/layouts/SchoolLayout";
import { api } from "~/trpc/react";
import { getUserPublicMetadata } from "~/utils/get-user-public-metadata";

interface SchoolPageProps {
  schoolId: string;
  user: User & { Role: Role };
  canteen?: Canteen;
}

export default function SchoolPage({ schoolId, canteen }: SchoolPageProps) {
  const { data: purchaseRequestsMonthlyValueInLast360DaysData } =
    api.purchaseRequest.purchaseRequestsMonthlyValueInLast360Days.useQuery({
      schoolId,
    });

  const { data: purchaseRequestsTimeToFinalStatusInLast360DaysData } =
    api.purchaseRequest.purchaseRequestsTimeToFinalStatusInLast360Days.useQuery(
      {
        schoolId,
      },
    );

  return (
    <SchoolLayout>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Valor total de solicitações de compra por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={
          purchaseRequestsMonthlyValueInLast360DaysData?.length
            ? purchaseRequestsMonthlyValueInLast360DaysData?.map((d) => ({
                month: d.month,
                Valor: d.value,
              }))
            : []
        }
        index="month"
        categories={["Valor"]}
        customTooltip={CustomChartTooltip}
      />

      <h3 className="text-tremor-content-strong text-lg font-medium">
        Tempo médio para finalização de solicitações de compra por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={
          purchaseRequestsTimeToFinalStatusInLast360DaysData?.length
            ? purchaseRequestsTimeToFinalStatusInLast360DaysData?.map((d) => ({
                month: d.month,
                "Dias para fechar": d.averageDaysToFinish,
              }))
            : []
        }
        index="month"
        categories={["Dias para fechar"]}
        customTooltip={CustomChartTooltip}
      />

      <PurchaseRequestsByMonthChart schoolId={schoolId} />

      {canteen && (
        <>
          <CanteenSellsQuantityByMonthChart canteenId={canteen.id} />
          <CanteenSellsValueByMonthChart canteenId={canteen.id} />
        </>
      )}
    </SchoolLayout>
  );
}

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const schoolSlug = params?.["school-slug"] as string;
  const school = await trpCaller.school.bySlug({ slug: schoolSlug });
  if (!school) {
    // Redirect to 404 page
    throw new Error(`School with slug ${schoolSlug} not found`);
  }

  const clerkAuth = getAuth(req);

  if (!clerkAuth.userId) {
    // Redirect to sign in page
    return {
      redirect: {
        destination: `/sign-in?redirectTo=/escola/${schoolSlug}`,
        permanent: false,
      },
    };
  }

  const prefetches = [
    serverSideHelpers.purchaseRequest.purchaseRequestsMonthlyValueInLast360Days.prefetch(
      {
        schoolId: school.id,
      },
    ),
    serverSideHelpers.purchaseRequest.purchaseRequestsTimeToFinalStatusInLast360Days.prefetch(
      {
        schoolId: school.id,
      },
    ),
    serverSideHelpers.purchaseRequest.purchaseRequestsLast360DaysByMonth.prefetch(
      {
        schoolId: school.id,
      },
    ),
  ];

  const user = await clerkClient.users.getUser(clerkAuth.userId);

  const userPublicMetadata = getUserPublicMetadata(user);

  const userId = userPublicMetadata.id;

  const userFromMyDb = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      Role: true,
    },
  });

  if (!userFromMyDb) {
    return {
      redirect: {
        destination: `/sign-in?redirectTo=/escola/${schoolSlug}`,
        permanent: false,
      },
    };
  }
  let canteen: Canteen | undefined = undefined;

  if (userFromMyDb.Role.name === "CANTEEN_WORKER") {
    prefetches.push(
      serverSideHelpers.canteen.canteenSellsByMonth.prefetch({
        canteenId: userId,
      }),
    );
    const schoolCanteen = await prisma.canteen.findFirst({
      where: {
        responsibleUserId: userFromMyDb.id,
      },
    });
    if (schoolCanteen) {
      canteen = schoolCanteen;
    }
  }

  await Promise.all(prefetches);

  return {
    props: {
      schoolId: school.id,
      user: userFromMyDb,
      canteen,
      trpcState: serverSideHelpers.dehydrate(),
    },
  };
};
