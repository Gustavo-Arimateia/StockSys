import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";

import Header from "./Header";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({
  children,
}: AppLayoutProps) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    const handleRouteChange = () =>
      setSidebarOpen(false);

    router.events.on(
      "routeChangeComplete",
      handleRouteChange,
    );

    return () => {
      router.events.off(
        "routeChangeComplete",
        handleRouteChange,
      );
    };
  }, [router.events]);

  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Fechar menu"
        />
      )}

      <div className="min-h-screen lg:pl-64">
        <Header
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}