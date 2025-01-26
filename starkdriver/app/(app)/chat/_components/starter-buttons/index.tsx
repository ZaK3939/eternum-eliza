import React from 'react'

import StarterButton from './starter-button';

const starterButtons = [
    {
        title: "Trending",
        description: "Search the trending tokens",
        icon: "Coins" as const,
        prompt: "Show me the trending tokens"
    }, 
    {
        title: "Stake",
        description: "Stake Sol",
        icon: "Coins" as const,
        prompt: "Find me the best staking yields"
    },
    {
        title: "Trade",
        description: "Swap on Jupiter",
        icon: "ChartCandlestick" as const,
        prompt: "Let's trade some tokens"
    },
    {
        title: "Knowledge",
        description: "Get developer docs for protocols",
        icon: "Brain" as const,
        prompt: "Get me developer docs for Orca"
    }
] as const

const StarterButtons = () => {
    return (
        <div className="grid grid-cols-2 gap-2">
            {starterButtons.map((button) => (
                <StarterButton 
                    key={button.title} 
                    {...button}
                />
            ))}
        </div>
    )
}

export default StarterButtons