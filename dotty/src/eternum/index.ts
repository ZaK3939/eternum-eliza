import { Plugin } from '@ai16z/eliza';
import { buildingAction } from './actions';
// import { DatabaseService } from '../common/db';

export const eternumPlugin: Plugin = {
  name: 'eternum',
  description: 'Eternum city building game database plugin',
  actions: [buildingAction],
  evaluators: [],
  providers: [],
  services: [],
};

export default eternumPlugin;
