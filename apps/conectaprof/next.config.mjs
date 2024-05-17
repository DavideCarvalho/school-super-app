/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds and Linting.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	/** Enables hot reloading for local packages without a build step */
	transpilePackages: ["@acme/api", "@acme/auth", "@acme/db", "@acme/ui"],
	/** We already do linting and typechecking as separate tasks in CI */
	// Add this again once we fix all the current linting and typechecking issues
	// eslint: { ignoreDuringBuilds: !!process.env.CI },
	// typescript: { ignoreBuildErrors: !!process.env.CI },
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
};

export default config;
