export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  disabled?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
