import type { AppProps } from "next/app";

import AppLayout from "@/components/layout/AppLayout";
import ToastProvider from "@/components/ui/ToastProvider";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </ToastProvider>
  );
}
