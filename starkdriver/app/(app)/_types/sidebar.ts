import { IconName } from "@/types";

export type SidebarGroup = {
    label: string;
    items: SidebarItem[];
    loading?: boolean;
}

export type SidebarItem = {
    icon?: IconName;
    label: string;
    href: string;
    external?: boolean;
    onClick?: () => void;
    isActive?: boolean;
}