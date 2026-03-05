import { createContext, useContext, useState } from 'react';

const AdsContext = createContext(null);

export const AdsProvider = ({ children }) => {
  const [isRewardedOpen, setIsRewardedOpen] = useState(false);
  const [rewardedResolve, setRewardedResolve] = useState(null);
  const [rewardedReject, setRewardedReject] = useState(null);

  const showRewardedAd = () => {
    return new Promise((resolve, reject) => {
      setRewardedResolve(() => resolve);
      setRewardedReject(() => reject);
      setIsRewardedOpen(true);
    });
  };

  const claimAd = () => {
    setIsRewardedOpen(false);
    document.body.style.overflow = '';
    if (rewardedResolve) {
      rewardedResolve();
      setRewardedResolve(null);
      setRewardedReject(null);
    }
  };

  const cancelAd = () => {
    setIsRewardedOpen(false);
    document.body.style.overflow = '';
    if (rewardedReject) {
      rewardedReject(new Error('User cancelled'));
      setRewardedResolve(null);
      setRewardedReject(null);
    }
  };

  const closeAd = () => {
    setIsRewardedOpen(false);
    document.body.style.overflow = '';
  };

  // Prevent body scroll when modal is open
  if (isRewardedOpen) {
    document.body.style.overflow = 'hidden';
  }

  return (
    <AdsContext.Provider
      value={{
        isOpen: isRewardedOpen,
        showRewardedAd,
        claimAd,
        cancelAd,
        closeAd,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
};

export const RewardedContext = AdsContext;
export const useRewardedModal = () => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useRewardedModal must be used within an AdsProvider');
  }
  return context;
};
