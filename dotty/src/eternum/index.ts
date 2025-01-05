import { Plugin } from '@elizaos/core';
import { resourceQueryAction } from './actions/resource.ts';
import { resourceQueryEvaluator } from './evaluator/resource.ts';
import resourceQueryProvider from './provider/resourceQueryProvider.ts';

export const eternumPlugin: Plugin = {
  name: 'eternum',
  description: 'Eternum city building game database plugin',
  // actions: [buildingAction, resourcesAction],
  actions: [resourceQueryAction],
  // evaluators: [buildingQueryEvaluator, resourceQueryEvaluator],
  evaluators: [resourceQueryEvaluator],
  providers: [resourceQueryProvider],
  services: [],
};

export default eternumPlugin;
