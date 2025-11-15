"use client";

import { Tab5ScrollWrapper } from "@/components/navigation/tab5-scroll-wrapper";
import React from "react";

export default function Tab5Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Tab5ScrollWrapper>
      <main className="flex flex-1 flex-col p-2 transition-all duration-300 ease-in-out">
        <div className="rounded-md">
          {children}
        </div>
      </main>
    </Tab5ScrollWrapper>
  );
}
