import type { GetServerSidePropsContext } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";
import { LineChart } from "@tremor/react";

import { serverSideHelpers, trpCaller } from "@acme/api";

import { CustomChartTooltip } from "~/components/custom-chart-tooltip";
import { SchoolLayout } from "~/layouts/SchoolLayout";
import { api } from "~/utils/api";

interface SchoolPageProps {
  schoolId: string;
}

export default function SchoolPage({ schoolId }: SchoolPageProps) {
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

  const { data: purchaseRequestsLast360DaysByMonthData } =
    api.purchaseRequest.purchaseRequestsLast360DaysByMonth.useQuery({
      schoolId,
    });

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

      <h3 className="text-tremor-content-strong text-lg font-medium">
        Solicitações de compra por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={
          purchaseRequestsLast360DaysByMonthData?.length
            ? purchaseRequestsLast360DaysByMonthData?.map((d) => ({
                month: d.month,
                "Solicitações criadas": d.count,
              }))
            : []
        }
        index="month"
        categories={["Solicitações criadas"]}
        customTooltip={CustomChartTooltip}
      />
    </SchoolLayout>
  );
}

export const getServerSideProps = wrapGetServerSidePropsWithSentry(
  async ({ req, params }: GetServerSidePropsContext) => {
    const schoolSlug = params?.["school-slug"] as string;
    const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    if (!school) {
      // Redirect to 404 page
      throw new Error(`School with slug ${schoolSlug} not found`);
    }

    const clerkUser = getAuth(req);

    if (!clerkUser.userId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}`,
          permanent: false,
        },
      };
    }

    await Promise.all([
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
    ]);

    return {
      props: {
        schoolId: school.id,
        trpcState: serverSideHelpers.dehydrate(),
      },
    };
  },
  "/escola/[school-slug]",
);
