import { useState } from "react";

const CollapsibleText = ({ text, limit = 50 }: { text?: string; limit?: number }) => {
    const [expanded, setExpanded] = useState(false);

    if (!text) return <span className="text-gray-400">—</span>;

    const isLong = text.length > limit;
    const displayText = expanded || !isLong ? text : text.slice(0, limit) + "...";

    return (
        <div className="max-w-xs">
            <p className="text-sm text-gray-700">{displayText}</p>
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-600 text-xs mt-1 hover:underline"
                >
                    {expanded ? "Show Less" : "Show More"}
                </button>
            )}
        </div>
    );
};
export default CollapsibleText;