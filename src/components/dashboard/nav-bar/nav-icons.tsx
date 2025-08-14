import {
  Faders,
  Files,
  House,
  Invoice,
  User,
  Users,
  Notebook,
  Lockers
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";

export const navIcons = {
  home: House,
  files: Files,
  invoice: Invoice,
  tasks: Notebook,
  settings: Faders,
  user: User,
  users: Users,
  inventory: Lockers
} as Record<string, Icon>;
