import {
  Faders,
  Files,
  House,
  Invoice,
  User,
  Users,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";

export const navIcons = {
  home: House,
  files: Files,
  invoice: Invoice,
  settings: Faders,
  user: User,
  users: Users,
} as Record<string, Icon>;
