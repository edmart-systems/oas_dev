"use client";

import AuthGuard from "@/components/auth/auth-guard";
import UiActivityMonitor from "@/components/auth/ui-activity-monitor";
import AppDataFetcher from "@/components/dashboard/common/app-data-fetcher";
import { MainNav } from "@/components/dashboard/nav-bar/main-nav";
import NotificationsDrawer from "@/components/dashboard/nav-bar/notifications/notifications-drawer";
import { SideNav } from "@/components/dashboard/nav-bar/side-nav";
import { Box, Container, GlobalStyles } from "@mui/material";
import React, { ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  useEffect(() => {
    const detectSidebarWidth = () => {
      const sidebars = document.querySelectorAll('div');
      for (const sidebar of Array.from(sidebars)) {
        const style = window.getComputedStyle(sidebar);
        if (style.position === 'fixed' && 
            style.left === '0px' && 
            style.zIndex === '1100' &&
            (style.width === '80px' || style.width === '280px')) {
          const width = parseInt(style.width);
          setSidebarWidth(width);
          break;
        }
      }
    };

    detectSidebarWidth();
    const interval = setInterval(detectSidebarWidth, 50);

    // Add MutationObserver for immediate detection
    const observer = new MutationObserver(detectSidebarWidth);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      <AuthGuard>
        <UiActivityMonitor>
          <GlobalStyles
            styles={{
              body: {
                "--MainNav-height": "56px",
                "--MainNav-zIndex": 1000,
                "--SideNav-width": "280px",
                "--SideNav-zIndex": 1100,
                "--MobileNav-width": "320px",
                "--MobileNav-zIndex": 1100,
              },
            }}
          />
          <Box
            sx={{
              bgcolor: "var(--mui-palette-background-default)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              minHeight: "100%",
            }}
          >
            <SideNav />
            <Box
              sx={{
                display: "flex",
                flex: "1 1 auto",
                flexDirection: "column",
                pl: { lg: `${sidebarWidth}px` },
                transition: "padding-left 0.3s ease",
              }}
            >
              <MainNav />
              <main
                style={{
                  padding: "16px 16px",
                  width: "100%",
                  transition: "all 0.3s ease",
                }}
              >
                {children}
                <AppDataFetcher />
              </main>
              <NotificationsDrawer />
            </Box>
          </Box>
        </UiActivityMonitor>
      </AuthGuard>
    </div>
  );
};

export default DashboardLayout;
