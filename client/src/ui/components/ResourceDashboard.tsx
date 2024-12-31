import React, { useMemo } from 'react';
import { useDojo } from '@/hooks/context/DojoContext';
import { useEntities } from '../../hooks/helpers/useEntities';
import { ResourceIcon } from '../elements/ResourceIcon';
import Button from '@/ui/elements/Button';
import { BaseContainer } from '../containers/BaseContainer';
import { RESOURCE_TIERS } from '@bibliothecadao/eternum';
import { getComponentValue } from '@dojoengine/recs';
import { getEntityIdFromKeys } from '@/utils/utils';
import useNextBlockTimestamp from '@/hooks/useNextBlockTimestamp';
import { ResourceChip } from '../components/resources/ResourceChip';
import useUIStore from '@/hooks/store/useUIStore';

const EntityResources = ({ structure }: { structure: any }) => {
  const { currentDefaultTick: tick } = useNextBlockTimestamp();
  const dojo = useDojo();
  const entityId = structure.entity_id.toString();

  // エンティティの詳細情報を取得
  const position = structure.position || { x: 0, y: 0 };

  return (
    <div className='mb-4 last:mb-0'>
      <div className='bg-gold/10 p-2 rounded mb-2'>
        <div className='text-sm text-gold flex items-center gap-2 mb-1'>
          <ResourceIcon resource='House' size='xs' />
          <span>
            {structure.name || `Entity ${entityId}`} ({structure.category})
          </span>
        </div>
        <div className='text-xs text-gold/50 flex items-center gap-2'>
          <div>
            Position: ({position.x}, {position.y})
          </div>
          <div>Created: {new Date(Number(structure.created_at)).toLocaleString()}</div>
        </div>
      </div>

      {Object.entries(RESOURCE_TIERS).map(([tier, resourceIds]) => (
        <div key={tier} className='mb-2 last:mb-0'>
          <div className='text-gold/50 text-xs mb-1 uppercase'>{tier}</div>
          <div className='grid grid-cols-1 gap-1'>
            {resourceIds.map((resourceId: any) => (
              <ResourceChip
                key={resourceId}
                resourceId={resourceId}
                entityId={entityId}
                tick={tick}
                maxStorehouseCapacityKg={Infinity}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ResourceDashboard = () => {
  const { playerStructures } = useEntities();
  const structures = playerStructures();

  if (structures.length === 0) {
    return <div>No structures available</div>;
  }

  return (
    <div className='fixed top-4 left-4 pointer-events-auto'>
      <BaseContainer className='w-[300px] overflow-hidden rounded-lg border-2 border-gold/20'>
        <div className='p-2 flex flex-col space-y-1'>
          <Button variant='secondary' className='w-full mb-2'>
            <div className='flex items-center gap-2'>
              <ResourceIcon resource='Lords' size='xs' />
              <span className='text-brown'>Bridge Lords & Resources</span>
            </div>
          </Button>

          <div className='space-y-1 max-h-[70vh] overflow-y-auto p-2'>
            {structures.map((structure) => (
              <EntityResources key={structure.entity_id.toString()} structure={structure} />
            ))}
          </div>

          <div className='mt-2 pt-2 border-t border-gold/20'>
            <div className='flex items-center gap-2 text-gray-400 text-sm'>
              <ResourceIcon resource='Silo' size='xs' />
              <span>Total Structures: {structures.length}</span>
            </div>
          </div>
        </div>
      </BaseContainer>
    </div>
  );
};

export default ResourceDashboard;
