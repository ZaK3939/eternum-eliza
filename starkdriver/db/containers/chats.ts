import { getContainer } from '@/db/containers/utils';

import { Container } from '@azure/cosmos';

import { Chat } from '../types';

export const CHATS_CONTAINER_ID = 'chats';

let chatsContainer: Container;

export const getChatsContainer = async () => {
  if (!chatsContainer) chatsContainer = await getContainer<Chat>(CHATS_CONTAINER_ID, 'userId');
  return chatsContainer;
};
