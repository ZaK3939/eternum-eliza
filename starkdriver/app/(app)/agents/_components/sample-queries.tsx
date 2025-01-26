'use client'

import React from 'react'

interface Props {
    sampleQueries: string[];
}

const SampleQueries: React.FC<Props> = ({ sampleQueries }) => {
    return (
        <div>
            <h2 className="text-lg font-bold">Sample Queries</h2>
            <ul className="list-disc list-inside">
                {sampleQueries.map((query, index) => (
                    <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300">
                        {query}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SampleQueries;