import { SidebarGroup } from '../../_types/sidebar';

export const platformGroup: SidebarGroup = {
  label: 'Platform',
  items: [
    {
      icon: 'MessageSquare',
      label: 'Chat',
      href: '/chat',
    },
    {
      icon: 'Twitter',
      label: 'Follow Us',
      href: 'https://x.com/eternum_zak',
      external: true,
    },
  ],
};
