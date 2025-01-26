'use client';

import { useEffect, useState } from 'react';
import { setup } from './setup';
import { PrivyProvider } from './privy';
import { DojoProvider } from '../_hooks/DojoContext';
import { StarknetProvider } from '../_hooks/starknet-provider';
import { getRawDojoConfig } from './dojoConfig';
// import { createDojoConfig } from '@dojoengine/core';

type ProvidersProps = Readonly<{
  children: React.ReactNode;
}>;

export default function Providers({ children }: ProvidersProps) {
  const [setupResult, setSetupResult] = useState<any>(null);

  useEffect(() => {
    const initSetup = async () => {
      try {
        const core = await import('@dojoengine/core');
        const { createDojoConfig } = core;
        const rawConfig = getRawDojoConfig();
        const config = createDojoConfig(rawConfig);
        const result = await setup(config);
        setSetupResult(result);
      } catch (error) {
        console.error('Setup failed:', error);
      }
    };
    initSetup();
  }, []);

  if (!setupResult) {
    return <div>Loading...</div>;
  }

  return (
    <PrivyProvider>
      <StarknetProvider>
        <DojoProvider value={setupResult}>{children}</DojoProvider>
      </StarknetProvider>
    </PrivyProvider>
  );
}
