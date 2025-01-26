'use client'

import React from 'react'

import Link from 'next/link';

import { usePathname } from 'next/navigation';

import { 
    Icon,
    SidebarGroup as SidebarGroupUI, 
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    Skeleton
} from '@/components/ui';

import { SidebarGroup as SidebarGroupType } from '../../_types';


interface Props {
    group: SidebarGroupType;
    empty?: React.ReactNode;
}

const SidebarGroup: React.FC<Props> = ({ group, empty }) => {

    const pathname = usePathname();

    return (
        <SidebarGroupUI>
            <SidebarGroupLabel>
                {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                {
                    group.loading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        group.items.length > 0 ? (
                            <SidebarMenu>
                                {
                                    group.items.map((item) => (
                                        <SidebarMenuItem
                                            key={item.label}
                                        >
                                            <SidebarMenuButton 
                                                asChild 
                                                isActive={pathname === item.href && (item.isActive ?? true)}
                                                onClick={item.onClick}
                                            >
                                                <Link 
                                                    href={item.href} 
                                                    target={item.external ? '_blank' : undefined}
                                                >
                                                    {item.icon && <Icon name={item.icon} />}
                                                    <span className='truncate'>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                }
                            </SidebarMenu>
                        ) : (empty ? empty : null)
                    )
                }
            </SidebarGroupContent>
        </SidebarGroupUI>
    )
}

export default SidebarGroup