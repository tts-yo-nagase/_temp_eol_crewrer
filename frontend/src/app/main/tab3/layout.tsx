"use client";

import { Tab3ScrollWrapper } from "@/components/navigation/tab3-scroll-wrapper";
import React from "react";

export default function Tab3Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Tab3ScrollWrapper>
      <main className="flex flex-1 flex-col p-2 transition-all duration-300 ease-in-out">
        <div className="rounded-md">
          {children}
        </div>
      </main>
    </Tab3ScrollWrapper>
  );
}
