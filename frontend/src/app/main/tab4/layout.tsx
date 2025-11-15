"use client";

import { Tab4ScrollWrapper } from "@/components/navigation/tab4-scroll-wrapper";
import React from "react";

export default function Tab4Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Tab4ScrollWrapper>
      <main className="flex flex-1 flex-col p-2 transition-all duration-300 ease-in-out">
        <div className="rounded-md">
          {children}
        </div>
      </main>
    </Tab4ScrollWrapper>
  );
}
