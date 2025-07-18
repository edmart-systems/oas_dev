import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Fragment, ReactNode } from "react";
import NextTopLoader from "nextjs-toploader";
import "@/styles/global.css";
import { LocalizationProvider } from "@/components/core/localization-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import AuthProvider from "@/components/auth/auth-provider";
import "react-toastify/dist/ReactToastify.css";
import ToastProvider from "@/components/toast/toast-provider";
import ReduxProvider from "@/components/redux/redux-provider";
import SessionMonitor from "@/components/auth/session-monitor";

export const viewport = {
  width: "device-width",
  initialScale: 1,
} satisfies Viewport;

export const metadata: Metadata = {
  title: "Office X",
  description: "Office Automation System",
};

type Props = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: Props): JSX.Element => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lavishly+Yours&family=Style+Script&family=Borel&family=Yellowtail&family=Playwrite+IN:wght@100..400&family=Princess+Sofia&family=Send+Flowers&family=Vibur&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextTopLoader color="#D98219" height={4} />
        <AuthProvider>
          <LocalizationProvider>
            <Fragment>
              <ReduxProvider>
                <ThemeProvider>
                  <SessionMonitor>{children}</SessionMonitor>
                  <ToastProvider />
                </ThemeProvider>
              </ReduxProvider>
            </Fragment>
          </LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
