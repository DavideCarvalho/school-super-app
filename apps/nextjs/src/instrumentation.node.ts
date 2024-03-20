import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
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
  spanProcessor: new SentrySpanProcessor(),
  textMapPropagator: new SentryPropagator(),
});

sdk.start();
