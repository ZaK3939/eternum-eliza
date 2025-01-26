export const dynamic = 'force-dynamic';
import Chat from './_components/chat';

import NotLoggedInAlert from './_components/not-logged-in-alert';

export default function Home() {
  return (
    <div className='h-full w-full'>
      <Chat />
      <NotLoggedInAlert />
    </div>
  );
}
