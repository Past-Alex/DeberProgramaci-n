import React from 'react';
import { Heart } from 'lucide-react';
import { ReactionType } from '../../types';
import { getReactionsCount, REACTIONS, parseUserReaction } from '../../utils';

interface ReactionButtonProps {
  likedBy: string[];
  userId: string;
  onLike: (type: ReactionType) => void;
  size?: 'sm' | 'md';
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({ 
  likedBy, 
  userId, 
  onLike, 
  size = 'sm' 
}) => {
  const reactionCounts = getReactionsCount(likedBy);
  const totalReactions = likedBy.length;
  
  const topReactions = (Object.entries(reactionCounts) as [ReactionType, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  const userReaction = parseUserReaction(likedBy, userId);
  const currentReactionConfig = userReaction ? REACTIONS.find(r => r.type === userReaction) : null;

  const isMd = size === 'md';

  return (
    <div className={`flex flex-col ${isMd ? 'mt-4' : 'mt-2'}`}>
      {topReactions.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 ml-1">
          <div className="flex items-center -space-x-1">
            {topReactions.map((type, i) => {
              const rConf = REACTIONS.find(r => r.type === type);
              return (
                <div 
                  key={type} 
                  className="w-5 h-5 rounded-full bg-stone-50 border border-white shadow-sm flex items-center justify-center text-[10px]" 
                  style={{ zIndex: 3 - i }}
                >
                  {rConf?.emoji}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-stone-500 font-outfit hover:underline cursor-pointer">
            {totalReactions}
          </span>
        </div>
      )}

      <div className="relative group/reaction flex items-center">
        {/* Hover Menu */}
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/reaction:flex bg-white rounded-full shadow-lg border border-stone-100 p-1.5 gap-1 transform transition-all z-10">
          {/* Bridge for hover gap */}
          <div className="absolute top-full left-0 w-full h-2" />
          {REACTIONS.map(reaction => (
            <button
              key={reaction.type}
              onClick={(e) => {
                e.stopPropagation();
                onLike(reaction.type);
              }}
              className="w-10 h-10 hover:scale-125 transition-transform duration-200 transform origin-bottom flex items-center justify-center text-2xl relative group/tooltip"
            >
              {reaction.emoji}
              <span className="absolute -top-8 bg-stone-800 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {reaction.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(userReaction ? userReaction : 'like');
          }}
          className={`flex items-center gap-2 rounded-full border transition-colors font-outfit font-medium ${
            isMd ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
          } ${
            userReaction 
              ? `border-${currentReactionConfig?.color.replace('text-', '')}/30 ${currentReactionConfig?.bg} ${currentReactionConfig?.color}` 
              : 'border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-50'
          }`}
        >
          {userReaction ? (
            <span className={`${isMd ? 'text-xl' : 'text-lg'} leading-none`}>
              {currentReactionConfig?.emoji}
            </span>
          ) : (
            <Heart size={isMd ? 20 : 16} />
          )}
          <span>{userReaction ? currentReactionConfig?.label : 'Me gusta'}</span>
        </button>
      </div>
    </div>
  );
};
