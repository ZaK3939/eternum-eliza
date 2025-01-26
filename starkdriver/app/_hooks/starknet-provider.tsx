import { getSeasonAddresses } from './utils/utils';
import ControllerConnector from '@cartridge/connector/controller';
import { ColorMode } from '@cartridge/controller';
import { mainnet, sepolia } from '@starknet-react/chains';
import { Connector, StarknetConfig, jsonRpcProvider, voyager } from '@starknet-react/core';
import React, { useCallback, useEffect, useState } from 'react';
import { env } from '../_contexts/env';

interface ResourceAddresses {
  [key: string]: [number, string];
}

const preset: string = 'eternum';
const theme: string = 'eternum';
const slot: string = env.NEXT_PUBLIC_SLOT;
const namespace: string = 's0_eternum';
const colorMode: ColorMode = 'dark';

const vrfPolicy = {
  target: '0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f',
  method: 'request_random',
  description: 'Allows requesting random numbers from the VRF provider',
};

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const [controller, setController] = useState<ControllerConnector | null>(null);

  useEffect(() => {
    async function initController() {
      const resourceAddresses = getSeasonAddresses();
      const LORDS = resourceAddresses?.['LORDS']?.[1] ?? '';
      const otherResources = Object.entries((resourceAddresses as ResourceAddresses) ?? {})
        .filter(([key]) => key !== 'LORDS')
        .map(([_, [__, address]]) => address);

      const newController =
        env.NEXT_PUBLIC_CHAIN === 'mainnet'
          ? new ControllerConnector({
              rpc: env.NEXT_PUBLIC_NODE_URL,
              namespace,
              slot,
              preset,
              tokens: {
                erc20: [LORDS, ...otherResources],
              },
              colorMode,
            })
          : new ControllerConnector({
              rpc: env.NEXT_PUBLIC_NODE_URL,
              namespace,
              slot,
              preset,
              policies: [vrfPolicy],
              theme,
              tokens: {
                erc20: [LORDS, ...otherResources],
              },
              colorMode,
            });

      setController(newController);
    }

    initController();
  }, []);

  const rpc = useCallback(() => {
    return { nodeUrl: env.NEXT_PUBLIC_NODE_URL };
  }, []);

  if (!controller) return <div>Loading...</div>;

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={jsonRpcProvider({ rpc })}
      connectors={[controller as never as Connector]}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
