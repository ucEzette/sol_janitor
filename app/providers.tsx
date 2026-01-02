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
  const CREATOR_ADDRESS = "DRDspmzu5F7SJN5rjJEwqdDi7cRcvYUXxf8BgqvqtxG6";

  return (
    <ClientProvidersDynamic creator={CREATOR_ADDRESS}>
      {children}
    </ClientProvidersDynamic>
  );
}