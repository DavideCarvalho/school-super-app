import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <header className="bg-white py-4 sm:py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="shrink-0">
              <a href="#" title="" className="">
                <Image
                  className="h-8 w-auto"
                  src="https://landingfoliocom.imgix.net/store/collection/saasui/images/logo.svg"
                  alt=""
                  width={32}
                  height={32}
                />
              </a>
            </div>

            <div className="hidden lg:ml-12 lg:flex lg:items-center lg:space-x-4">
              <a
                href="#"
                title=""
                className="focus:ring-ring-300 inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-base font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Funcionalidades
              </a>

              <a
                href="#"
                title=""
                className="focus:ring-ring-300 inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-base font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Fale conosco
              </a>

              <a
                href="#"
                title=""
                className="focus:ring-ring-300 inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-base font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Preço
              </a>
            </div>

            <div className="hidden sm:ml-auto sm:flex sm:items-center sm:justify-end sm:space-x-4">
              <a
                href="#"
                title=""
                className="focus:ring-ring-900 inline-flex items-center justify-center rounded-full border border-gray-900 px-6 py-2.5 text-base font-medium text-gray-900 transition-all duration-200 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                role="button"
              >
                Login
              </a>
            </div>

            <div className="ml-4 flex lg:hidden">
              <button
                type="button"
                className="transiton-all inline-flex items-center rounded-full border border-gray-900 p-2.5 text-gray-900 duration-200 hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
              >
                <span x-show="!expanded" aria-hidden="true">
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </span>

                <span x-show="expanded" aria-hidden="true">
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-2">
            <div className="flex flex-col justify-between lg:order-2">
              <div className="flex-1">
                <span className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
                  #1 Email marketing tool in the market
                </span>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl sm:tracking-tight xl:text-7xl">
                  Gerenciar sua escola nunca foi tão fácil!
                </h1>
              </div>

              <div className="mt-6 lg:mt-auto">
                <p className="text-lg leading-7 text-gray-700 lg:text-xl lg:leading-8">
                  Super app te da tudo que você precisa para gerenciar sua
                  escola! Desde controle das salas de aula, alunos, professores,
                  até controle da cantina!
                </p>
                <div className="mt-10">
                  <Link
                    href="#"
                    title=""
                    className="inline-flex items-center justify-center rounded-xl border border-transparent bg-blue-600 px-8 py-4 text-base font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                    role="button"
                  >
                    Interessado? Entre em contato!
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:order-1">
              <div className="relative mx-auto w-full max-w-sm">
                <Image
                  className="relative mx-auto w-full max-w-xs rounded-2xl sm:max-w-sm"
                  src="https://landingfoliocom.imgix.net/store/collection/saasui/images/hero/5/portrait-girl.png"
                  alt=""
                  width={500}
                  height={500}
                />

                <div className="absolute bottom-0 left-0 mb-12 -ml-2 w-72 rounded-2xl bg-white shadow-2xl sm:mb-24 sm:-ml-24 lg:-ml-12 xl:-ml-24">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-start">
                      <svg
                        className="h-9 w-9 shrink-0 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                      </svg>
                      <div className="ml-4">
                        <p className="text-3xl font-semibold text-gray-900">
                          34,585
                        </p>
                        <p className="mt-1 text-lg font-normal text-gray-700">
                          Secured emails are sent last week
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Pricing() {
  return (
    <section className="py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
            Pricing & Plans
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-600">
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
            sint. Velit officia consequat duis.
          </p>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-center space-x-2.5">
            <span className="text-base font-medium text-gray-900">Monthly</span>

            <button
              type="button"
              className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-blue-600 bg-transparent py-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
              role="switch"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none inline-block h-4 w-4 translate-x-6 rounded-full bg-blue-600 shadow transition duration-200 ease-in-out"
              ></span>
            </button>

            <span className="text-base font-medium text-gray-900">Yearly</span>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-9">
          <div className="overflow-hidden rounded-md border-2 border-gray-200 bg-transparent">
            <div className="p-6 md:py-8 md:px-9">
              <h3 className="text-xl font-semibold text-black">Personal</h3>
              <p className="mt-2.5 text-sm text-gray-600">
                All the basic features to boost your freelance career
              </p>

              <div className="mt-5 flex items-end">
                <div className="flex items-start">
                  <span className="text-xl font-medium text-black"> $ </span>
                  <p className="text-6xl font-medium tracking-tight">39</p>
                </div>
                <span className="ml-0.5 text-lg text-gray-600"> / month </span>
              </div>

              <a
                href="#"
                title=""
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-fuchsia-600 bg-transparent px-4 py-3 font-semibold text-gray-900 transition-all duration-200 hover:bg-fuchsia-600 hover:text-white focus:bg-fuchsia-600 focus:text-white"
                role=""
              >
                Start 14 Days Free Trial
              </a>

              <ul className="mt-8 flex flex-col space-y-4">
                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    {" "}
                    1 Domain License{" "}
                  </span>
                  <svg
                    className="ml-0.5 h-4 w-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    Full Celebration Library
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    {" "}
                    120+ Coded Blocks{" "}
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-400 line-through">
                    Design Files Included
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-400 line-through">
                    Premium Support
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border-2 border-transparent bg-white">
            <div className="p-6 md:py-8 md:px-9">
              <h3 className="text-xl font-semibold text-black">Agency</h3>
              <p className="mt-2.5 text-sm text-gray-600">
                All the extended features to boost your agency career
              </p>

              <div className="mt-5 flex items-end">
                <div className="flex items-start">
                  <span className="text-xl font-medium text-black"> $ </span>
                  <p className="text-6xl font-medium tracking-tight">99</p>
                </div>
                <span className="ml-0.5 text-lg text-gray-600"> / month </span>
              </div>

              <a
                href="#"
                title=""
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-transparent bg-gradient-to-r from-fuchsia-600 to-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:opacity-80 focus:opacity-80"
                role=""
              >
                Start 14 Days Free Trial
              </a>

              <ul className="mt-8 flex flex-col space-y-4">
                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    {" "}
                    100 Domain License{" "}
                  </span>
                  <svg
                    className="ml-0.5 h-4 w-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    {" "}
                    Full Celebration Library{" "}
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    {" "}
                    120+ Coded Blocks{" "}
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    {" "}
                    Design Files Included{" "}
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    Premium Support
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Contact us
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-500">
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
            sint. Velit officia consequat duis.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
          <div className="grid grid-cols-1 gap-6 px-8 text-center md:grid-cols-3 md:px-0">
            <div className="overflow-hidden rounded-xl bg-white">
              <div className="p-6">
                <svg
                  className="mx-auto h-10 w-10 flex-shrink-0 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <p className="mt-6 text-lg font-medium text-gray-900">
                  +1-316-555-0116
                </p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  +1-446-526-0117
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white">
              <div className="p-6">
                <svg
                  className="mx-auto h-10 w-10 flex-shrink-0 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-6 text-lg font-medium text-gray-900">
                  contact@example.com
                </p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  hr@example.com
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white">
              <div className="p-6">
                <svg
                  className="mx-auto h-10 w-10 flex-shrink-0 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="mt-6 text-lg font-medium leading-relaxed text-gray-900">
                  8502 Preston Rd. Ingle, Maine 98380, USA
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl bg-white">
            <div className="px-6 py-12 sm:p-12">
              <h3 className="text-center text-3xl font-semibold text-gray-900">
                Send us a message
              </h3>

              <form action="#" method="POST" className="mt-14">
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      {" "}
                      Your name{" "}
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="text"
                        name=""
                        id=""
                        placeholder="Enter your full name"
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Email address
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="email"
                        name=""
                        id=""
                        placeholder="Enter your full name"
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Phone number
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="tel"
                        name=""
                        id=""
                        placeholder="Enter your full name"
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Company name
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="text"
                        name=""
                        id=""
                        placeholder="Enter your full name"
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      {" "}
                      Message
                    </label>
                    <div className="relative mt-2.5">
                      <textarea
                        name=""
                        id=""
                        placeholder=""
                        className="block w-full resize-y rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <img
          className="mx-auto h-8 w-auto"
          src="https://cdn.rareblocks.xyz/collection/clarity/images/logo.svg"
          alt=""
        />

        <ul className="mt-14 flex flex-wrap items-center justify-center space-x-12 md:space-x-16">
          <li>
            <a
              href="#"
              title=""
              className="font-pj inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600"
            >
              {" "}
              About{" "}
            </a>
          </li>

          <li>
            <a
              href="#"
              title=""
              className="font-pj inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600"
            >
              {" "}
              Features{" "}
            </a>
          </li>

          <li>
            <a
              href="#"
              title=""
              className="font-pj inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600"
            >
              {" "}
              Works{" "}
            </a>
          </li>

          <li>
            <a
              href="#"
              title=""
              className="font-pj mt-8 -ml-12 inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600 sm:ml-0 sm:mt-0"
            >
              {" "}
              Support{" "}
            </a>
          </li>

          <li>
            <a
              href="#"
              title=""
              className="font-pj mt-8 inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600 sm:mt-0"
            >
              {" "}
              Help{" "}
            </a>
          </li>
        </ul>

        <div className="mt-12">
          <svg
            className="mx-auto h-4 w-auto text-gray-300"
            viewBox="0 0 172 16"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 11 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 46 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 81 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 116 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 151 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 18 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 53 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 88 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 123 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 158 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 25 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 60 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 95 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 130 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 165 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 32 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 67 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 102 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 137 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 172 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 39 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 74 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 109 1)"
            />
            <line
              y1="-0.5"
              x2="18.0278"
              y2="-0.5"
              transform="matrix(-0.5547 0.83205 0.83205 0.5547 144 1)"
            />
          </svg>
        </div>

        <ul className="mt-12 flex items-center justify-center space-x-3">
          <li>
            <a
              href="#"
              target="_blank"
              title=""
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
              rel="noopener"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
              </svg>
            </a>
          </li>

          <li>
            <a
              href="#"
              target="_blank"
              title=""
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
              rel="noopener"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
              </svg>
            </a>
          </li>

          <li>
            <a
              href="#"
              target="_blank"
              title=""
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
              rel="noopener"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z"></path>
                <circle cx="16.806" cy="7.207" r="1.078"></circle>
                <path d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.08 5.08 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z"></path>
              </svg>
            </a>
          </li>

          <li>
            <a
              href="#"
              target="_blank"
              title=""
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
              rel="noopener"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
                ></path>
              </svg>
            </a>
          </li>
        </ul>

        <p className="font-pj mt-7 text-center text-base font-normal text-gray-600">
          © Copyright 2021, All Rights Reserved
        </p>
      </div>
    </footer>
  );
}

export function Features() {
  return (
    <section className="bg-white py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 md:grid-cols-3 lg:gap-y-16">
          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-blue-100"
                width="72"
                height="75"
                viewBox="0 0 72 75"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M63.6911 28.8569C68.0911 48.8121 74.6037 61.2674 53.2349 65.9792C31.8661 70.6909 11.6224 61.2632 7.22232 41.308C2.82229 21.3528 3.6607 12.3967 25.0295 7.68503C46.3982 2.97331 59.2911 8.90171 63.6911 28.8569Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Secured Payments
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-orange-100"
                width="62"
                height="64"
                viewBox="0 0 62 64"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M62 13.001C62 33.4355 53.9345 64.001 33.5 64.001C13.0655 64.001 0 50.435 0 30.0005C0 9.56596 2.56546 4.00021 23 4.00021C43.4345 4.00021 62 -7.43358 62 13.001Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-orange-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">Rápido</h3>
            <p className="mt-4 text-base text-gray-600">
              Nos preocupamos em deixar o sistema o mais rápido possível para
              que você e sua equipe não percam tempo.
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-green-100"
                width="66"
                height="68"
                viewBox="0 0 66 68"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M65.5 30C65.5 50.4345 46.4345 68 26 68C5.56546 68 0 50.4345 0 30C0 9.56546 12.5655 0 33 0C53.4345 0 65.5 9.56546 65.5 30Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">Impressão</h3>
            <p className="mt-4 text-base text-gray-600">
              Gerencie pedidos de impressão de seus professores e acompanhe o
              andamento de cada um deles
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-purple-100"
                width="66"
                height="68"
                viewBox="0 0 66 68"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M65.5 30C65.5 50.4345 46.4345 68 26 68C5.56546 68 0 50.4345 0 30C0 9.56546 12.5655 0 33 0C53.4345 0 65.5 9.56546 65.5 30Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Tarefas
              <span className="ml-2  rounded-xl bg-purple-300 p-1 text-sm">
                Em breve
              </span>
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Saiba exatamente o que você precisa fazer em order de prioridade
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-gray-100"
                width="65"
                height="70"
                viewBox="0 0 65 70"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M64.5 26C64.5 46.4345 56.4345 70 36 70C15.5655 70 0 53.9345 0 33.5C0 13.0655 13.0655 0 33.5 0C53.9345 0 64.5 5.56546 64.5 26Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Cantina
              <span className="ml-2  rounded-xl bg-purple-300 p-1 text-sm">
                Em breve
              </span>
            </h3>
            <p className="mt-4 text-base text-gray-600">
              De a sua cantina um sistema para que ela controle tudo! Produtos,
              vendas, e muito mais!
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-yellow-100"
                width="78"
                height="78"
                viewBox="0 0 78 78"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.49996 28.0002C4.09993 47.9554 14.1313 66.7885 35.5 71.5002C56.8688 76.2119 68.0999 58.4553 72.5 38.5001C76.9 18.5449 68.3688 12.711 47 7.99931C25.6312 3.28759 12.9 8.04499 8.49996 28.0002Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Secured Payments
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-gray-100"
                width="62"
                height="64"
                viewBox="0 0 62 64"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M62 13.001C62 33.4355 53.9345 64.001 33.5 64.001C13.0655 64.001 0 50.435 0 30.0005C0 9.56596 2.56546 4.00021 23 4.00021C43.4345 4.00021 62 -7.43358 62 13.001Z"></path>
              </svg>
              <svg
                className="absolute h-9 w-9 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Light & Dark Version
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-rose-100"
                width="72"
                height="75"
                viewBox="0 0 72 75"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M63.6911 28.8569C68.0911 48.8121 74.6037 61.2674 53.2349 65.9792C31.8661 70.6909 11.6224 61.2632 7.22232 41.308C2.82229 21.3528 3.6607 12.3967 25.0295 7.68503C46.3982 2.97331 59.2911 8.90171 63.6911 28.8569Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-rose-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Secured Payments
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-lime-100"
                width="62"
                height="65"
                viewBox="0 0 62 65"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 13.0264C0 33.4609 8.06546 64.0264 28.5 64.0264C48.9345 64.0264 62 50.4604 62 30.0259C62 9.59135 59.4345 4.0256 39 4.0256C18.5655 4.0256 0 -7.40819 0 13.0264Z" />
              </svg>

              <svg
                className="absolute h-9 w-9 text-lime-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Fast & Easy to Load
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
