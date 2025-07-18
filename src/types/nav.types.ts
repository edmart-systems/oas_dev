export interface NavItemConfig {
  key: string;
  title?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  icon?: string;
  href?: string;
  adminOnly: boolean;
  items?: NavItemConfig[];
  matcher?: { type: "startsWith" | "equals" | "includes"; href: string };
}
