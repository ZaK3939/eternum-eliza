import React from 'react';

import {
  Sidebar as SidebarUI,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  Separator,
} from '@/components/ui';

import SidebarGroup from './group';

import { platformGroup, agentsGroup } from '../../_data';

import AuthButton from './auth-button';
// import ColorModeToggle from './color-mode-toggle';
import Logo from './logo';
import ChatsGroup from './chats-group';

interface Props {
  children: React.ReactNode;
}

const Sidebar: React.FC<Props> = ({ children }) => {
  return (
    <>
      <SidebarUI variant='inset' collapsible='icon'>
        <SidebarHeader>
          <Logo />
          <AuthButton />
        </SidebarHeader>
        <SidebarContent>
          <ChatsGroup />
          <SidebarGroup group={platformGroup} />
          <SidebarGroup group={agentsGroup} />
        </SidebarContent>
      </SidebarUI>
      <SidebarInset>
        <header className='flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger />
            <Separator orientation='vertical' className='h-4' />
          </div>
          {/* <ColorModeToggle /> */}
        </header>
        <div className='p-4 flex-1 h-0 overflow-y-hidden'>{children}</div>
      </SidebarInset>
    </>
  );
};

export default Sidebar;
