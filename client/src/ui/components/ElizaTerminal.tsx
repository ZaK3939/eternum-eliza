import React, { useState, useEffect, useRef } from 'react';
import { BaseContainer } from '../containers/BaseContainer';
import { useEntities } from '@/hooks/helpers/useEntities';
import { ElizaManager, Message } from '../../eliza/ElizaManager';

const ElizaTerminal = () => {
  const { playerStructures } = useEntities();
  const structures = playerStructures();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [elizaManager] = useState(() => new ElizaManager(structures));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(elizaManager.getInitialMessages());
  }, [elizaManager]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCommand = (command: string) => {
    // Add user command to messages
    setMessages((prev) => [...prev, { type: 'user', text: command }]);

    // Process command and get response
    const response = elizaManager.processCommand(command);

    // Add response with delay for effect
    setTimeout(() => {
      setMessages((prev) => [...prev, ...response]);
    }, 500);

    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input.trim());
    }
  };

  const handleOptionClick = (option: string) => {
    const commandNumber = option.split('.')[0];
    handleCommand(commandNumber);
  };

  return (
    <div className='fixed top-4 right-4 pointer-events-auto'>
      <BaseContainer className='w-[400px] h-[600px] overflow-hidden rounded-lg border-2 border-gold/20'>
        <div className='p-2 flex flex-col h-full bg-black/90'>
          <div className='mb-2 px-2 py-1 bg-gold/10 rounded flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500/50'></div>
            <div className='w-3 h-3 rounded-full bg-yellow-500/50'></div>
            <div className='w-3 h-3 rounded-full bg-green-500/50'></div>
            <span className='text-gold/80 text-sm ml-2 font-mono'>ELIZA Terminal</span>
          </div>

          <div className='flex-1 overflow-y-auto font-mono text-sm p-2 space-y-3'>
            {messages.map((msg, index) => (
              <div key={index} className='space-y-1'>
                {msg.type === 'system' && <div className='text-gray-500'>[SYSTEM] {msg.text}</div>}
                {msg.type === 'eliza' && (
                  <div className='text-green-400'>
                    ELIZA{'>'} {msg.text}
                  </div>
                )}
                {msg.type === 'user' && (
                  <div className='text-gold/80'>
                    USER{'>'} {msg.text}
                  </div>
                )}
                {msg.type === 'thinking' && <div className='text-blue-400/70 italic'>{msg.text}</div>}
                {msg.type === 'options' && (
                  <div className='text-gray-300 ml-4 space-y-1'>
                    {msg.items?.map((item, i) => (
                      <div key={i} className='hover:text-gold cursor-pointer' onClick={() => handleOptionClick(item)}>
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className='mt-2 border-t border-gold/20 p-2'>
            <div className='flex items-center text-gray-400'>
              <span className='text-gold/50'>{'>'}</span>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='flex-1 bg-transparent border-none outline-none ml-2 font-mono text-gold/80'
                placeholder='Type your command...'
              />
              <span className='animate-pulse'>_</span>
            </div>
          </form>
        </div>
      </BaseContainer>
    </div>
  );
};

export default ElizaTerminal;
