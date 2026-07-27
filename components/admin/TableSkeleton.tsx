import React from 'react';

const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
    return (
        <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-white border-b animate-pulse">
                    {[...Array(cols)].map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};

export default TableSkeleton;
