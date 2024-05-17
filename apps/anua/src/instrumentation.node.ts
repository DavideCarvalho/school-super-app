import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import {
  SentryPropagator,
  SentrySpanProcessor,
} from "@sentry/opentelemetry-node";

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: "next-app",
  }),
  // Sentry config
  spanProcessors: [],
  textMapPropagator: new SentryPropagator(),
});

sdk.start();
