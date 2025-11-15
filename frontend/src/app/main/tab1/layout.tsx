"use client";

import { Tab1ScrollWrapper } from "@/components/navigation/tab1-scroll-wrapper";
import React from "react";

export default function Tab1Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Tab1ScrollWrapper>
      <main className="flex flex-1 flex-col p-2 transition-all duration-300 ease-in-out">
        <div className="rounded-md">
          {children}
        </div>
      </main>
    </Tab1ScrollWrapper>
  );
}
