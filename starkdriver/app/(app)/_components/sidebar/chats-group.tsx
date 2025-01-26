'use client'

import React from 'react'

import Link from 'next/link';

import { usePrivy } from '@privy-io/react-auth';

import { 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarGroupContent, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
    Skeleton,
    Button,
    Icon,
} from '@/components/ui';

import { useUserChats } from '@/hooks';

import { useChat } from '../../chat/_contexts/chat';

const ChatsGroup: React.FC = () => {

    const { ready, user } = usePrivy();

    const { chats, isLoading } = useUserChats();

    const { setChat, chatId, resetChat } = useChat();

    return (
        <SidebarGroup>
            <div className='flex items-center justify-between'>
                <SidebarGroupLabel className='text-black dark:text-white font-semibold'>
                    Chats
                </SidebarGroupLabel>
                <Link href='/chat'>
                    <Button 
                        variant='ghost' 
                        onClick={resetChat}
                        className="hover:bg-neutral-200 dark:hover:bg-neutral-700 h-fit w-fit p-1"
                    >
                        <Icon name='Plus' />
                    </Button>
                </Link>
            </div>
            <SidebarGroupContent>
                {
                    isLoading || !ready ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        chats.length > 0 ? (
                            <SidebarMenu>
                                {
                                    chats.slice(0, 5).map((chat) => (
                                        <SidebarMenuItem
                                            key={chat.id}
                                        >
                                            <SidebarMenuButton 
                                                asChild 
                                                isActive={chat.id === chatId}
                                                onClick={() => setChat(chat.id)}
                                            >
                                                <Link 
                                                    href={`/chat`} 
                                                >
                                                    <span className='truncate'>{chat.tagline}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                }
                            </SidebarMenu>
                        ) : (
                            user ? (
                                <p className='text-sm text-neutral-500 dark:text-neutral-400 pl-2'>
                                    No chats found
                                </p>
                            ) : (
                                <p className='text-sm text-neutral-500 dark:text-neutral-400 pl-2'>
                                    Sign in to view your chats
                                </p>
                            )
                        )
                    )
                }
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export default ChatsGroup;