"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import queryString from "query-string";

// How do I get the pathname with hash.
// source: https://github.com/vercel/next.js/discussions/49465
export const useHashQueryValue = (queryKey: string) => {
  const getHashQueryValue = useMemo(
    () => () => {
      const hash =
        typeof window !== "undefined"
          ? window.location.hash.replace(/^#!?/, "")
          : "";
      const [, ...hashQueryStringParams] = hash.split("?");
      const foundQuery = hashQueryStringParams.find(
        (param) => param.split("=")[0] === queryKey,
      );
      return foundQuery?.split("=")[1] ?? undefined;
    },
    [queryKey],
  );
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hashQueryValue, _setHashQueryValue] = useState<string | undefined>(
    getHashQueryValue(),
  );

  const setHashQueryValue = (newValue: string) => {
    const hash =
      typeof window !== "undefined"
        ? window.location.hash.replace(/^#!?/, "")
        : "";
    const [hashWithoutQueryString, ...hashQueryStringParams] = hash.split("?");
    let newHashQueryString = [];
    if (!newValue) {
      newHashQueryString = hashQueryStringParams.filter((queryString) => {
        return queryString.split("=")[0] !== queryKey;
      });
      const updatedUrl = `${pathname}${searchParams?.toString()}${hashWithoutQueryString}?${hashQueryStringParams.join("&")}`;
      router.replace(updatedUrl);
    } else {
      newHashQueryString = hashQueryStringParams.map((queryString) => {
        if (queryString.split("=")[0] !== queryKey) return queryString;
        return `${queryString.split("=")[0]}=${newValue}`;
      });
    }
    const updatedUrl = `${pathname}${searchParams?.toString()}${hashWithoutQueryString}?${hashQueryStringParams.join("&")}`;

    _setHashQueryValue(newValue);
    router.replace(updatedUrl);
  };
  useEffect(() => {
    const currentHash = getHashQueryValue();
    _setHashQueryValue(currentHash);
  }, [params]);

  const handleHashChange = () => {
    const currentHash = getHashQueryValue();
    _setHashQueryValue(currentHash);
  };

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return [hashQueryValue, setHashQueryValue] as const;
};
