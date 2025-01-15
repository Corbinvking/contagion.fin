import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Check, Loader2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface VoteButtonProps {
  mutationId: string;
  colorClass: string;
  bgClass: string;
  hoverClass: string;
}

const VoteButton: React.FC<VoteButtonProps> = ({
  mutationId,
  colorClass,
  bgClass,
  hoverClass
}) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingVote, setIsCheckingVote] = useState(false);

  // Check if user has already voted for this mutation
  useEffect(() => {
    let isMounted = true;

    const checkVote = async () => {
      // Only check if user is logged in and we have a mutation ID
      if (!user || !mutationId) {
        setIsCheckingVote(false);
        return;
      }

      try {
        setIsCheckingVote(true);
        setError(null);

        const { data, error } = await supabase
          .from('mutation_votes')
          .select('id')
          .eq('mutation_id', mutationId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Only update state if component is still mounted
        if (isMounted) {
          setHasVoted(data && data.length > 0);
        }
      } catch (err) {
        console.error('Error checking vote status:', err);
        if (isMounted) {
          setError('Failed to check vote status');
        }
      } finally {
        if (isMounted) {
          setIsCheckingVote(false);
        }
      }
    };

    checkVote();

    return () => {
      isMounted = false;
    };
  }, [user, mutationId]);

  const handleVote = async () => {
    if (!user) {
      setError('Please sign in to vote');
      return;
    }

    try {
      setIsVoting(true);
      setError(null);

      const { error: voteError } = await supabase
        .from('mutation_votes')
        .insert([{ 
          mutation_id: mutationId,
          user_id: user.id
        }]);

      if (voteError) {
        if (voteError.code === '23505') { // Unique violation
          setHasVoted(true); // User has already voted
          return;
        }
        throw voteError;
      }

      setHasVoted(true);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (!user) {
    return (
      <motion.button
        className={`w-full max-w-md mx-auto py-3 px-4 ${bgClass} ${colorClass} 
                   rounded-lg transition-colors flex items-center justify-center gap-3
                   opacity-75`}
      >
        <Lock className="w-5 h-5" />
        <span>Sign in to Vote</span>
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleVote}
        disabled={isVoting || hasVoted || isCheckingVote}
        className={`w-full max-w-md mx-auto py-3 px-4 ${bgClass} ${hoverClass} ${colorClass} 
                   rounded-lg transition-colors flex items-center justify-center gap-3
                   disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden`}
        whileHover={{ scale: hasVoted ? 1 : 1.02 }}
        whileTap={{ scale: hasVoted ? 1 : 0.98 }}
      >
        <AnimatePresence mode="wait">
          {isCheckingVote ? (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Checking...</span>
            </motion.div>
          ) : isVoting ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Voting...</span>
            </motion.div>
          ) : hasVoted ? (
            <motion.div
              key="voted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Vote Recorded!</span>
            </motion.div>
          ) : (
            <motion.div
              key="vote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Vote className="w-5 h-5" />
              <span>Vote for Next Mutation</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-2 text-sm text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoteButton;