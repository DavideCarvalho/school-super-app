import { withSentryConfig } from "@sentry/nextjs";
import { withSuperjson } from "next-superjson";

import { fileURLToPath } from "node:url";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	/** Enables hot reloading for local packages without a build step */
	transpilePackages: ["@acme/api", "@acme/db", "@acme/ui"],

	/** We already do linting and typechecking as separate tasks in CI */
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "landingfoliocom.imgix.net",
			},
		],
	},
	experimental: {
		instrumentationHook: false,
	},
};

// const configWithSentry = withSentryConfig(
// 	config,
// 	{
// 		// For all available options, see:
// 		// https://github.com/getsentry/sentry-webpack-plugin#options

// 		// Suppresses source map uploading logs during build
// 		silent: true,
// 		org: "anua",
// 		project: "anua",
// 		url: "https://anua-glitchtip-prod.v03c1h.easypanel.host/",
// 	},
// 	{
// 		// For all available options, see:
// 		// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// 		// Upload a larger set of source maps for prettier stack traces (increases build time)
// 		widenClientFileUpload: true,

// 		// Transpiles SDK to be compatible with IE11 (increases bundle size)
// 		transpileClientSDK: true,

// 		// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers. (increases server load)
// 		// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// 		// side errors will fail.
// 		tunnelRoute: "/monitoring",

// 		// Hides source maps from generated client bundles
// 		hideSourceMaps: true,

// 		// Automatically tree-shake Sentry logger statements to reduce bundle size
// 		disableLogger: true,

// 		// Enables automatic instrumentation of Vercel Cron Monitors.
// 		// See the following for more information:
// 		// https://docs.sentry.io/product/crons/
// 		// https://vercel.com/docs/cron-jobs
// 		automaticVercelMonitors: true,
// 	},
// );

export default withSuperjson()(config);
