import { Plugin } from '@ai16z/eliza';
import { buildingAction } from './actions/building.ts';

export const eternumPlugin: Plugin = {
  name: 'eternum',
  description: 'Eternum city building game database plugin',
  actions: [buildingAction],
  evaluators: [],
  providers: [],
  services: [],
};

export default eternumPlugin;
