'use client';
import type { ReactNode } from 'react';
import CartridgeSmall from '@/public/icons/cartridge-small.svg';
import { SetupNetworkResult } from '../dojo/setupNetwork';
import { ContractAddress } from '@bibliothecadao/eternum';
import ControllerConnector from '@cartridge/connector/controller';
import { BurnerProvider, useBurnerManager } from '@dojoengine/create-burner';
import { HasValue, runQuery } from '@dojoengine/recs';
import { cairoShortStringToFelt } from '@dojoengine/torii-client';
import { useAccount, useConnect } from '@starknet-react/core';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { Account, AccountInterface, RpcProvider } from 'starknet';
import { Env, env } from '../_contexts/env';
import { SetupResult } from '../_contexts/setup';
import { displayAddress } from './utils/utils';
// import { useQuery } from './helpers/useQuery';
import { useAddressStore } from './store/useAddressStore';
import { useAccountStore } from './accountStore';

interface DojoAccount {
  create: () => void;
  list: () => any[];
  get: (id: string) => any;
  select: (id: string) => void;
  account: Account | AccountInterface;
  isDeploying: boolean;
  clear: () => void;
  accountDisplay: string;
}

interface DojoContextType extends SetupResult {
  masterAccount: Account | AccountInterface;
  account: DojoAccount;
}

export interface DojoResult {
  setup: DojoContextType;
  account: DojoAccount;
  network: SetupNetworkResult;
  masterAccount: Account | AccountInterface;
}

const DojoContext = createContext<DojoContextType | null>(null);

const requiredEnvs: (keyof Env)[] = [
  'NEXT_PUBLIC_MASTER_ADDRESS',
  'NEXT_PUBLIC_MASTER_PRIVATE_KEY',
  'NEXT_PUBLIC_ACCOUNT_CLASS_HASH',
];

for (const _env of requiredEnvs) {
  if (!env[_env]) {
    throw new Error(`環境変数${_env}が設定されていません！`);
  }
}

type DojoProviderProps = {
  children: ReactNode;
  value: SetupResult;
};

type DojoContextProviderProps = {
  children: ReactNode;
  value: SetupResult;
  masterAccount: Account;
  controllerAccount: AccountInterface | null;
};

const useMasterAccount = (rpcProvider: RpcProvider) => {
  const masterAddress = env.NEXT_PUBLIC_MASTER_ADDRESS;
  const privateKey = env.NEXT_PUBLIC_MASTER_PRIVATE_KEY;
  return useMemo(() => new Account(rpcProvider, masterAddress, privateKey), [rpcProvider, masterAddress, privateKey]);
};

const useRpcProvider = () => {
  return useMemo(
    () =>
      new RpcProvider({
        nodeUrl: env.NEXT_PUBLIC_NODE_URL || 'http://localhost:5050',
      }),
    [],
  );
};

const useControllerAccount = (): AccountInterface | null => {
  const { account, connector, isConnected } = useAccount();

  useEffect(() => {
    if (account) {
      useAccountStore.getState().setAccount(account);
    }
  }, [account, isConnected]);

  useEffect(() => {
    if (connector) {
      useAccountStore.getState().setConnector(connector as unknown as ControllerConnector);
    }
  }, [connector, isConnected]);

  return account || null;
};

export const DojoProvider = ({ children, value }: DojoProviderProps) => {
  const currentValue = useContext(DojoContext);
  if (currentValue) throw new Error('DojoProviderは一度しか使用できません');

  const rpcProvider = useRpcProvider();
  const masterAccount = useMasterAccount(rpcProvider);
  const controllerAccount = useControllerAccount();

  return (
    <BurnerProvider
      initOptions={{
        masterAccount,
        accountClassHash: env.NEXT_PUBLIC_ACCOUNT_CLASS_HASH,
        rpcProvider,
        feeTokenAddress: env.NEXT_PUBLIC_FEE_TOKEN_ADDRESS,
      }}
    >
      <DojoContextProvider value={value} masterAccount={masterAccount} controllerAccount={controllerAccount}>
        {children}
      </DojoContextProvider>
    </BurnerProvider>
  );
};

export const useDojo = (): DojoResult => {
  const contextValue = useContext(DojoContext);
  if (!contextValue) throw new Error('`useDojo`フックはDojoProvider内で使用する必要があります');

  return {
    setup: contextValue,
    account: contextValue.account,
    network: contextValue.network,
    masterAccount: contextValue.masterAccount,
  };
};

const DojoContextProvider = ({ children, value, masterAccount, controllerAccount }: DojoContextProviderProps) => {
  const setAddressName = useAddressStore((state) => state.setAddressName);
  // const { handleUrlChange } = useQuery();
  const { connect, connectors } = useConnect();
  const { isConnected, isConnecting } = useAccount();

  const {
    create,
    list,
    get,
    account: burnerAccount,
    select,
    isDeploying,
    clear,
  } = useBurnerManager({
    burnerManager: value.network.burnerManager,
  });

  const connectWallet = async () => {
    try {
      console.log('ウォレット接続を試みています...');
      await connect({ connector: connectors[0] });
      console.log('ウォレット接続に成功しました。');
    } catch (error) {
      console.error('ウォレット接続に失敗:', error);
    }
  };

  if (isConnecting) {
    return <div className='flex items-center justify-center min-h-screen'>接続中...</div>;
  }

  if (!isConnected && !isConnecting && !controllerAccount) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <button
          onClick={connectWallet}
          className='flex items-center px-4 py-2 space-x-2 text-black bg-[#FCB843] rounded hover:bg-[#FCB843]/80'
        >
          <CartridgeSmall className='w-5 fill-black' />
          <span>ログイン</span>
        </button>
      </div>
    );
  }

  if (!controllerAccount && isConnected) {
    return <div className='flex items-center justify-center min-h-screen'>読み込み中...</div>;
  }

  return (
    <DojoContext.Provider
      value={{
        ...value,
        masterAccount,
        account: {
          create,
          list,
          get,
          select,
          clear,
          account: controllerAccount!,
          isDeploying,
          accountDisplay: displayAddress(controllerAccount?.address || ''),
        },
      }}
    >
      {children}
    </DojoContext.Provider>
  );
};
