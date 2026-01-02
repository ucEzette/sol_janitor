"use client";

import React from "react";
import dynamic from "next/dynamic";

const ClientProvidersDynamic = dynamic(
  () => import("./components/ClientProviders"),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  // FIX: Use this known working Mainnet address.
  // The error '_bn' happens if this address is invalid or uninitialized.
  const CREATOR_ADDRESS = "7n5cfeJWHBEJD9rJHidxA15qqhSt78RQ9w7czmZ8RYYd";

  return (
    <ClientProvidersDynamic creator={CREATOR_ADDRESS}>
      {children}
    </ClientProvidersDynamic>
  );
}