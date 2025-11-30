"use client";

import NavbarClient from "@/components/NavbarClient";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />
      {children}
    </div>
  );
}
