'use client'

import React from 'react'
import { useLogin } from '@/hooks'
import { Wallet } from '@privy-io/react-auth'
import { Button } from '@/components/ui'

interface Props {
  onComplete?: (wallet: Wallet) => void
}

export function LogInButton({ onComplete }: Props) {
  const { login, user, connectWallet } = useLogin({ onComplete })

  return (
    <Button
      variant="brand"
      onClick={() => {
        if (user) {
          connectWallet()
        } else {
          login()
        }
      }}
      className="w-full"
      type="button"
    >
      {user ? 'Connect Wallet' : 'Login'}
    </Button>
  )
}

export default LogInButton
