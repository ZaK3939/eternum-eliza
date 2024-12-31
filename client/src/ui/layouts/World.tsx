import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Redirect } from 'wouter';
import { Leva } from 'leva';
import useUIStore from '../../hooks/store/useUIStore';
import { useDojo } from '@/hooks/context/DojoContext';
import { useEntities, PlayerStructure } from '../../hooks/helpers/useEntities';
import { useStructureEntityId } from '../../hooks/helpers/useStructureEntityId';
import { useFetchBlockchainData } from '@/hooks/store/useBlockchainStore';
import { LoadingScreen } from '../modules/LoadingScreen';
import ResourceDashboard from '../components/ResourceDashboard';
import { env } from '../../env';
import { LoadingStateKey } from '@/hooks/store/useWorldLoading';
import { ADMIN_BANK_ENTITY_ID } from '@bibliothecadao/eternum';
import { getComponentValue } from '@dojoengine/recs';
import { getEntityIdFromKeys } from '@dojoengine/utils';
import {
  debounceAddDonkeysAndArmiesSubscription,
  debouncedAddHyperstructureSubscription,
  debouncedAddMarketSubscription,
  debouncedAddToSubscription,
  debouncedAddToSubscriptionOneKey,
} from '../../dojo/debouncedQueries';
import ElizaTerminal from '../components/ElizaTerminal';

export const World = ({ backgroundImage }: { backgroundImage: string }) => {
  const [subscriptions, setSubscriptions] = useState<{ [entity: string]: boolean }>({});
  const isLoadingScreenEnabled = useUIStore((state) => state.isLoadingScreenEnabled);
  const setLoading = useUIStore((state) => state.setLoading);

  // Setup hooks
  useFetchBlockchainData();
  useStructureEntityId();

  const dojo = useDojo();
  const structureEntityId = useUIStore((state) => state.structureEntityId);
  const { playerStructures } = useEntities();
  const structures = playerStructures();

  const filteredStructures = useMemo(
    () => structures.filter((structure: PlayerStructure) => !subscriptions[structure.entity_id.toString()]),
    [structures, subscriptions],
  );

  // Structure subscription
  useEffect(() => {
    if (
      !structureEntityId ||
      subscriptions[structureEntityId.toString()] ||
      subscriptions[ADMIN_BANK_ENTITY_ID.toString()] ||
      structureEntityId === 999999999
    ) {
      return;
    }

    const position = getComponentValue(
      dojo.setup.components.Position,
      getEntityIdFromKeys([BigInt(structureEntityId)]),
    );

    setSubscriptions((prev) => ({
      ...prev,
      [structureEntityId.toString()]: true,
      [ADMIN_BANK_ENTITY_ID.toString()]: true,
      ...Object.fromEntries(filteredStructures.map((structure) => [structure.entity_id.toString(), true])),
    }));

    setLoading(LoadingStateKey.SelectedStructure, true);
    const fetch = async () => {
      try {
        await debouncedAddToSubscription(
          dojo.network.toriiClient,
          dojo.network.contractComponents as any,
          [structureEntityId.toString()],
          [{ x: position?.x || 0, y: position?.y || 0 }],
          () => setLoading(LoadingStateKey.SelectedStructure, false),
        );
      } catch (error) {
        console.error('Structure fetch failed:', error);
        setLoading(LoadingStateKey.SelectedStructure, false);
      }
    };

    fetch();
  }, [structureEntityId, filteredStructures]);

  // Structures subscription
  useEffect(() => {
    const fetch = async () => {
      setLoading(LoadingStateKey.PlayerStructuresOneKey, true);
      setLoading(LoadingStateKey.PlayerStructuresTwoKey, true);
      setLoading(LoadingStateKey.DonkeysAndArmies, true);

      try {
        await Promise.all([
          debouncedAddToSubscription(
            dojo.network.toriiClient,
            dojo.network.contractComponents as any,
            [...filteredStructures.map((structure) => structure.entity_id.toString())],
            [...filteredStructures.map((structure) => ({ x: structure.position.x, y: structure.position.y }))],
            () => setLoading(LoadingStateKey.PlayerStructuresOneKey, false),
          ),
          debouncedAddToSubscriptionOneKey(
            dojo.network.toriiClient,
            dojo.network.contractComponents as any,
            [...filteredStructures.map((structure) => structure.entity_id.toString())],
            () => setLoading(LoadingStateKey.PlayerStructuresTwoKey, false),
          ),
        ]);

        await debounceAddDonkeysAndArmiesSubscription(
          dojo.network.toriiClient,
          dojo.network.contractComponents as any,
          [...structures.map((structure) => structure.entity_id)],
          () => setLoading(LoadingStateKey.DonkeysAndArmies, false),
        );
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    if (filteredStructures.length > 0) {
      fetch();
    }
  }, [structures.length, filteredStructures.length]);

  // Market and Bank subscription
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(LoadingStateKey.Market, true);
        setLoading(LoadingStateKey.Bank, true);

        await Promise.all([
          debouncedAddToSubscription(
            dojo.network.toriiClient,
            dojo.network.contractComponents as any,
            [ADMIN_BANK_ENTITY_ID.toString()],
            [],
            () => setLoading(LoadingStateKey.Bank, false),
          ),
          debouncedAddMarketSubscription(dojo.network.toriiClient, dojo.network.contractComponents as any, () =>
            setLoading(LoadingStateKey.Market, false),
          ),
        ]);
      } catch (error) {
        console.error('Market/Bank fetch failed:', error);
      } finally {
        setLoading(LoadingStateKey.Bank, false);
        setLoading(LoadingStateKey.Market, false);
      }
    };

    fetch();
  }, []);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      id='world'
      className='world-selector fixed antialiased top-0 left-0 z-0 w-screen h-screen overflow-hidden pointer-events-none'
    >
      <div className='vignette' />

      <Suspense fallback={<LoadingScreen backgroundImage={backgroundImage} />}>
        <div className='pointer-events-auto'>
          <ResourceDashboard />
          <ElizaTerminal />
        </div>

        <Redirect to='/' />
        <Leva
          hidden={!env.VITE_PUBLIC_DEV || env.VITE_PUBLIC_HIDE_THREEJS_MENU}
          collapsed
          titleBar={{ position: { x: 0, y: 50 } }}
        />
      </Suspense>

      <div id='labelrenderer' className='absolute top-0 pointer-events-none z-10' />
    </div>
  );
};

export default World;
0;
