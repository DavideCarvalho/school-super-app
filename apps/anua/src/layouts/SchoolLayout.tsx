"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";

import { cn } from "~/lib/utils";
import { getUserPublicMetadata } from "~/utils/get-user-public-metadata";
import { matchesPathname } from "~/utils/url";

interface SchoolLayoutProps {
  children?: React.ReactNode;
}

interface RouteParams {
  schoolSlug: string;
  canteenId?: string;
}

interface Route {
  name: string;
  href: (params: RouteParams) => string;
}

const routes: Route[] = [
  {
    name: "Calendário escolar",
    href: (params) => `/escola/${params.schoolSlug}/calendario-escolar`,
  },
  {
    name: "Professores",
    href: (params) => `/escola/${params.schoolSlug}/professores`,
  },
  {
    name: "Turmas",
    href: (params) => `/escola/${params.schoolSlug}/turmas`,
  },
  {
    name: "Matérias",
    href: (params) => `/escola/${params.schoolSlug}/materias`,
  },
  {
    name: "Arquivos",
    href: (params) => `/escola/${params.schoolSlug}/arquivos`,
  },
  {
    name: "Cantinas",
    href: (params) => `/escola/${params.schoolSlug}/cantinas`,
  },
  {
    name: "Solicitações de compra",
    href: (params) => `/escola/${params.schoolSlug}/solicitacoes-de-compra`,
  },
  {
    name: "Funcionários",
    href: (params) => `/escola/${params.schoolSlug}/funcionarios`,
  },
];

const canteenRoutes: Route[] = [
  {
    name: "Itens da cantina",
    href: (params) => `/escola/${params.schoolSlug}/itens-cantina`,
  },
];

export function SchoolLayout({ children }: SchoolLayoutProps) {
  const { user } = useUser();
  const { pathname } = useRouter();
  if (!user) return null;
  const userPublicMetadata = getUserPublicMetadata(user);
  const schoolSlug = userPublicMetadata.school.slug;
  const canteenId = userPublicMetadata?.canteen?.id;
  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="-m-2 flex items-center lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <title>Menu</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            <div className="ml-6 mr-auto flex lg:ml-0">
              <div className="flex flex-shrink-0 items-center">
                <Image
                  className="block h-8 w-auto lg:hidden"
                  src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/logo-symbol.svg"
                  alt=""
                  width={500}
                  height={500}
                />
                <Image
                  className="hidden h-8 w-auto lg:block"
                  src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/logo.svg"
                  alt=""
                  width={500}
                  height={500}
                />
              </div>
            </div>

            {/* <div className="flex items-center justify-end space-x-6 sm:ml-5">
              <div className="relative">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <span className="absolute -top-px -right-1 inline-flex items-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                  2
                </span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <span className="absolute -top-px -right-1 inline-flex items-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                  6
                </span>
              </div>

              <button
                type="button"
                className="flex max-w-xs items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                <Image
                  className="h-8 w-8 rounded-full bg-gray-300 object-cover"
                  src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/vertical-menu/1/avatar-male.png"
                  width={500}
                  height={500}
                  alt=""
                />
                <span className="ml-2 hidden text-sm font-medium text-gray-900 md:block">
                  Jacob Jones
                </span>
                <svg
                  className="ml-3 h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div> */}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <div className="hidden border-r border-gray-200 md:flex md:w-64 md:flex-col">
          <div className="flex flex-col overflow-y-auto pt-5">
            <div className="flex h-full flex-1 flex-col justify-between px-4">
              <div className="space-y-4">
                <nav className="flex-1 space-y-1">
                  <Link
                    href={`/escola/${schoolSlug}`}
                    className="group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-200"
                  >
                    <svg
                      className="mr-4 h-5 w-5 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Dashboard</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Dashboard
                  </Link>
                  <p className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Administrativo
                  </p>
                  {routes.map((route) => {
                    const routeHref = route.href({ schoolSlug, canteenId });
                    return (
                      <Link
                        key={route.name}
                        href={routeHref}
                        className={cn(
                          "group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-200",
                          matchesPathname(routeHref, pathname)
                            ? "bg-gray-200"
                            : "",
                        )}
                      >
                        <svg
                          className="mr-4 h-5 w-5 flex-shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <title>{route.name}</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        {route.name}
                      </Link>
                    );
                  })}
                  <p className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Cantina
                  </p>
                  {canteenRoutes.map((route) => {
                    const routeHref = route.href({ schoolSlug, canteenId });
                    return (
                      <Link
                        key={route.name}
                        href={routeHref}
                        className={cn(
                          "group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-200",
                          matchesPathname(routeHref, pathname ?? "")
                            ? "bg-gray-200"
                            : "",
                        )}
                      >
                        <svg
                          className="mr-4 h-5 w-5 flex-shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <title>{route.name}</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        {route.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <main>
            <div className="py-6">
              <div className="px-4 sm:px-6 md:px-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
