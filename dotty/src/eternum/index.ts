import { Plugin } from '@ai16z/eliza';
import { buildingAction } from './actions/building.ts';
import { buildingQueryEvaluator } from './evaluator/building.ts';
import { resourcesAction } from './actions/resourse.ts';
import { resourceQueryEvaluator } from './evaluator/resource.ts';
import resourceQueryProvider from './provider/resourse.ts';

export const eternumPlugin: Plugin = {
  name: 'eternum',
  description: 'Eternum city building game database plugin',
  actions: [buildingAction, resourcesAction],
  evaluators: [buildingQueryEvaluator, resourceQueryEvaluator],
  providers: [resourceQueryProvider],
  services: [],
};

export default eternumPlugin;
