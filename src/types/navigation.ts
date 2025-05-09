import { ComponentType } from "react";
export interface NavItem {
  title: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  role?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
