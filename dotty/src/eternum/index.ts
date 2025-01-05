import { Plugin } from '@elizaos/core';
import { resourcesAction } from './actions/resourse.ts';
import { resourceQueryEvaluator } from './evaluator/resource.ts';
import resourceQueryProvider from './provider/resourse.ts';

export const eternumPlugin: Plugin = {
  name: 'eternum',
  description: 'Eternum city building game database plugin',
  // actions: [buildingAction, resourcesAction],
  actions: [resourcesAction],
  // evaluators: [buildingQueryEvaluator, resourceQueryEvaluator],
  evaluators: [resourceQueryEvaluator],
  providers: [resourceQueryProvider],
  services: [],
};

export default eternumPlugin;
