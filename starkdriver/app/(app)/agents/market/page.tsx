// app/(app)/agents/market/page.tsx
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { AgentPage } from '../_components';
import { marketAgent } from './_data';

export default function Page() {
  return <AgentPage agent={marketAgent} />;
}
