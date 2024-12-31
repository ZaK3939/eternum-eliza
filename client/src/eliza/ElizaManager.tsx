export type MessageType = 'system' | 'eliza' | 'user' | 'options' | 'thinking';

interface BaseMessage {
  type: MessageType;
  blink?: boolean;
}

interface TextMessage extends BaseMessage {
  type: 'system' | 'eliza' | 'user' | 'thinking';
  text: string;
}

interface OptionsMessage extends BaseMessage {
  type: 'options';
  items: string[];
}

export type Message = TextMessage | OptionsMessage;

export type ElizaCommand = {
  command: string;
  handler: () => Message[];
};

export class ElizaManager {
  private currentState: string = 'initial';
  private structures: any[] = [];
  private mainMenuItems = [
    '1. Review resource production',
    '2. Check neighboring territories',
    '3. Analyze military strength',
    '4. View diplomatic relations',
  ];

  constructor(structures: any[]) {
    this.structures = structures;
  }

  private commands: { [key: string]: ElizaCommand } = {
    '1': {
      command: 'Review resource production',
      handler: () => this.handleResourceProduction(),
    },
    '2': {
      command: 'Check neighboring territories',
      handler: () => this.handleNeighboringTerritories(),
    },
    '3': {
      command: 'Analyze military strength',
      handler: () => this.handleMilitaryStrength(),
    },
    '4': {
      command: 'View diplomatic relations',
      handler: () => this.handleDiplomaticRelations(),
    },
  };

  private returnToMainMenu(): Message[] {
    this.currentState = 'initial';
    return [
      {
        type: 'eliza',
        text: 'Returning to main menu. What would you like to do?',
      },
      {
        type: 'options',
        items: this.mainMenuItems,
      },
    ];
  }

  private handleResourceProduction(): Message[] {
    this.currentState = 'resources';
    return [
      {
        type: 'thinking',
        text: 'Analyzing resource production...',
      },
      {
        type: 'eliza',
        text: `I've analyzed the resource production of your ${this.structures.length} structures.`,
      },
      {
        type: 'options',
        items: [
          '1. View production rates',
          '2. Optimize resource allocation',
          '3. Check storage capacity',
          '4. Return to main menu',
        ],
      },
    ];
  }

  private handleNeighboringTerritories(): Message[] {
    this.currentState = 'territories';
    return [
      {
        type: 'thinking',
        text: 'Scanning neighboring territories...',
      },
      {
        type: 'eliza',
        text: 'I detect several interesting locations nearby:',
      },
      {
        type: 'options',
        items: [
          '1. View closest neighbors',
          '2. Analyze territory resources',
          '3. Check threat level',
          '4. Return to main menu',
        ],
      },
    ];
  }

  private handleMilitaryStrength(): Message[] {
    this.currentState = 'military';
    return [
      {
        type: 'thinking',
        text: 'Assessing military capabilities...',
      },
      {
        type: 'eliza',
        text: 'Current military assessment:',
      },
      {
        type: 'options',
        items: [
          '1. View army composition',
          '2. Check defense status',
          '3. Plan strategic deployment',
          '4. Return to main menu',
        ],
      },
    ];
  }

  private handleDiplomaticRelations(): Message[] {
    this.currentState = 'diplomacy';
    return [
      {
        type: 'thinking',
        text: 'Reviewing diplomatic status...',
      },
      {
        type: 'eliza',
        text: 'Current diplomatic standing:',
      },
      {
        type: 'options',
        items: [
          '1. View active alliances',
          '2. Check trade agreements',
          '3. Assess reputation',
          '4. Return to main menu',
        ],
      },
    ];
  }

  public getInitialMessages(): Message[] {
    return [
      {
        type: 'system',
        text: 'ETERNUM CONSOLE v1.0.1',
      },
      {
        type: 'system',
        text: 'Establishing connection to the realm...',
      },
      {
        type: 'eliza',
        text: 'Welcome, Commander. I am ELIZA, your realm management assistant.',
      },
      {
        type: 'eliza',
        text: `I notice you have ${this.structures.length} structures under your control.`,
      },
      {
        type: 'eliza',
        text: 'Your realms seem to be well positioned. Would you like to:',
      },
      {
        type: 'options',
        items: this.mainMenuItems,
      },
    ];
  }

  public processCommand(input: string): Message[] {
    if (input.toLowerCase() === 'back' || input === '4') {
      return this.returnToMainMenu();
    }

    if (input.toLowerCase() === 'help') {
      return [
        {
          type: 'system',
          text: 'Available commands:',
        },
        {
          type: 'options',
          items: [...this.mainMenuItems, 'help - Show this help message', 'back - Return to main menu'],
        },
      ];
    }

    const command = this.commands[input];
    if (command) {
      return command.handler();
    }

    if (this.currentState !== 'initial') {
      return this.handleSubCommand(input);
    }

    return [
      {
        type: 'eliza',
        text: 'I apologize, but I do not understand that command. Type "help" for available commands.',
      },
      {
        type: 'options',
        items: this.mainMenuItems,
      },
    ];
  }

  private handleSubCommand(input: string): Message[] {
    return [
      {
        type: 'eliza',
        text: `Processing sub-command "${input}" in state "${this.currentState}"...`,
      },
      {
        type: 'options',
        items: this.mainMenuItems,
      },
    ];
  }
}
