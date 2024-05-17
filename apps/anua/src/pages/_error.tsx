import Error from "next/error";
import * as Sentry from "@sentry/nextjs";
import { wrapErrorGetInitialPropsWithSentry } from "@sentry/nextjs";

const CustomErrorComponent = (props: any) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = wrapErrorGetInitialPropsWithSentry(
  async (contextData: any) => {
    // In case this is running in a serverless function, await this in order to give Sentry
    // time to send the error before the lambda exits
    await Sentry.captureUnderscoreErrorException(contextData);

    // This will contain the status code of the response
    return Error.getInitialProps(contextData);
  },
);

export default CustomErrorComponent;
