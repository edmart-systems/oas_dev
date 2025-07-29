import type { NavItemConfig } from "@/types/nav.types";
import { paths } from "@/utils/paths.utils";
import { navIcons } from "./nav-icons";
import { useAppSelector } from "@/redux/store";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import RouterLink from "next/link";
import { ReactNode } from "react";

const navItems: NavItemConfig[] = [
  {
    key: "dashboard",
    title: "Overview",
    href: paths.dashboard.overview,
    icon: "home",
    adminOnly: false,
    matcher: {
      type: "equals",
      href: paths.dashboard.overview,
    },
  },
  {
    key: "quotations",
    title: "Quotations",
    href: paths.dashboard.quotations.main,
    icon: "files",
    adminOnly: false,
  },
  {
    key: "invoices",
    title: "Invoices",
    href: paths.dashboard.invoices.main,
    icon: "invoice",
    adminOnly: false,
  },
    {
    key: "tasks",
    title: "Tasks",
    href: paths.dashboard.tasks.main,
    icon: "tasks",
    adminOnly: false,
  },
  {
    key: "settings",
    title: "Settings",
    href: paths.dashboard.settings,
    icon: "settings",
    adminOnly: false,
  },
  {
    key: "users",
    title: "Users",
    href: paths.dashboard.users.main,
    icon: "users",
    adminOnly: true,
  },
];

const isNavItemActive = ({
  disabled,
  external,
  href,
  matcher,
  pathname,
  _key,
}: Pick<NavItemConfig, "disabled" | "external" | "href" | "matcher"> & {
  pathname: string;
  _key: string;
}): boolean => {
  if (disabled || !href || external) {
    return false;
  }

  if (matcher) {
    if (matcher.type === "startsWith") {
      return pathname.startsWith(matcher.href);
    }

    if (matcher.type === "equals") {
      return pathname === matcher.href;
    }

    return false;
  }

  return pathname.includes(_key);
};

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  isCollapsed?: boolean;
}

const NavItem = ({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  _key,
  isCollapsed = false,
}: NavItemProps & {
  _key: string;
}): JSX.Element => {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
    _key,
  });
  const Icon = icon ? navIcons[icon] : null;
  const { mode: themeMode } = useAppSelector((state) => state.theme);

  const navItem = (
    <Box
      {...(href && !disabled
        ? {
            component: external ? "a" : RouterLink,
            href,
            target: external ? "_blank" : undefined,
            rel: external ? "noreferrer" : undefined,
          }
        : { role: "button" })}
      sx={{
        alignItems: "center",
        borderRadius: 1,
        color: "var(--NavItem-color)",
        cursor: "pointer",
        display: "flex",
        flex: "0 0 auto",
        gap: isCollapsed ? 0 : 1,
        p: isCollapsed ? "6px" : "6px 16px",
        position: "relative",
        textDecoration: "none",
        whiteSpace: "nowrap",
        justifyContent: isCollapsed ? "center" : "flex-start",
        ...(disabled && {
          bgcolor: "var(--NavItem-disabled-background)",
          color: "var(--NavItem-disabled-color)",
          cursor: "not-allowed",
        }),
        ...(active && {
          bgcolor: "var(--NavItem-active-background)",
          color: "var(--NavItem-active-color)",
        }),
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        {Icon ? (
          <Icon
            fill={
              active
                ? "var(--NavItem-icon-active-color)"
                : themeMode == "dark"
                ? "#fff"
                : "#000"
            }
            fontSize="var(--icon-fontSize-md)"
            weight={active ? "fill" : undefined}
          />
        ) : null}
      </Box>
      {!isCollapsed && (
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{
              color: "inherit",
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: "28px",
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <li>
      {isCollapsed ? (
        <Tooltip title={title} placement="right">
          {navItem}
        </Tooltip>
      ) : (
        navItem
      )}
    </li>
  );
};

export const renderNavItems = ({
  pathname,
  isAdmin,
  isCollapsed = false,
}: {
  pathname: string;
  isAdmin: boolean | undefined;
  isCollapsed?: boolean;
}): JSX.Element => {
  const children = navItems.reduce(
    (acc: ReactNode[], curr: NavItemConfig): ReactNode[] => {
      const { key, ...item } = curr;
      if (item.adminOnly) {
        if (isAdmin) {
          acc.push(
            <NavItem pathname={pathname} {...item} key={key} _key={key} isCollapsed={isCollapsed} />
          );
        }
      } else {
        acc.push(
          <NavItem pathname={pathname} {...item} key={key} _key={key} isCollapsed={isCollapsed} />
        );
      }

      return acc;
    },
    []
  );

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
};
