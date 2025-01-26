import { SidebarGroup } from '../../_types/sidebar';

export const agentsGroup: SidebarGroup = {
  label: 'Agents',
  items: [
    {
      icon: 'ChartLine',
      label: 'Market Agent',
      href: '/agents/market',
    },
    {
      icon: 'ChartCandlestick',
      label: 'Trading Agent',
      href: '/agents/trading',
    },
  ],
};
