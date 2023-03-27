import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignIn path="/sign-in" redirectUrl="/api/login" routing="path" />
    </main>
  );
};

// export async function getServerSideProps({
//   req,
//   query,
// }: GetServerSidePropsContext) {
//   // const redirectTo = (query.redirectTo as string | undefined) ?? "";

//   // const clerkUser = getAuth(req);

//   // if (clerkUser.userId) {
//   //   const user = await clerkClient.users.getUser(clerkUser.userId);
//   //   const primaryEmailAddress = user.emailAddresses.find(
//   //     ({ id }) => id === user.primaryEmailAddressId,
//   //   );

//   //   const dbUser = await prisma.user.findFirst({
//   //     where: {
//   //       email: primaryEmailAddress?.emailAddress,
//   //     },
//   //   });

//   //   if (!dbUser) {
//   //     return {
//   //       props: {
//   //         redirectTo: `/api/login?redirectTo=${redirectTo}`,
//   //       },
//   //     };
//   //   }

//   //   return {
//   //     redirect: {
//   //       destination: `/api/login`,
//   //       permanent: false,
//   //     },
//   //   };
//   // }

//   return {
//     props: {
//       redirectTo: `/api/login`,
//     },
//   };
// }

export default SignInPage;
