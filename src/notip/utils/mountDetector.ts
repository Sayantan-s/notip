import { useEffect, useEffectEvent } from "react";

export const trackMountCountToBlock = (defaultMountCount = 0, blockAt = 1) => {
  let mountCount = defaultMountCount;

  const useTrackMountCount = () => {
    const trackMountCount = useEffectEvent(() => {
      mountCount++;
      if (mountCount > blockAt) {
        throw new Error(
          "[Notip] Multiple <Notip /> providers detected. Notip should be a singleton in your app root.",
        );
      }
    });

    const cleanUpMountCount = useEffectEvent(() => {
      mountCount--;
    });

    useEffect(() => {
      trackMountCount();
      return cleanUpMountCount;
    }, []);
  };

  return useTrackMountCount;
};
