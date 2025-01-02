import { Plugin } from '@ai16z/eliza';
import { buildingAction } from './actions/building.ts';
import { buildingQueryEvaluator } from './evaluator.ts';

export const eternumPlugin: Plugin = {
  name: 'eternum',
  description: 'Eternum city building game database plugin',
  actions: [buildingAction],
  evaluators: [buildingQueryEvaluator],
  providers: [],
  services: [],
};

export default eternumPlugin;
