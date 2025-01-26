'use client'

import React from 'react'

import Link from 'next/link';

import { Logo as LogoBase, useSidebar } from '@/components/ui';

const Logo: React.FC = () => {

    const { open } = useSidebar();

    return (
        <Link href="/">
            <LogoBase
                showText={open}
                className="w-8 h-8"
            />
        </Link>
    )
}

export default Logo;