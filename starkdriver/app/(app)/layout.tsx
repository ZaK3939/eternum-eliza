import React from 'react';

import { SidebarProvider } from '@/components/ui';

import Sidebar from './_components/sidebar';

import { ChatProvider } from './chat/_contexts/chat';

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <SidebarProvider>
      <ChatProvider>
        <Sidebar>{children}</Sidebar>
      </ChatProvider>
    </SidebarProvider>
  );
};

export default Layout;
