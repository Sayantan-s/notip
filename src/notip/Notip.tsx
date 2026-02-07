import { useEffect, useEffectEvent } from "react";

let mountedCount = 0;

const cleanUpMountCount = () => {
  mountedCount--;
};

const ERROR_MESSAGE_ON_MULTIPLE_PROVIDER =
  "[Notip] Multiple <Notip /> providers detected. Notip should be a singleton in your app root.";

export const Notip = ({ children }: { children?: React.ReactNode }) => {
  const trackMountCount = useEffectEvent(() => {
    mountedCount++;
    if (mountedCount > 1) {
      throw new Error(ERROR_MESSAGE_ON_MULTIPLE_PROVIDER);
    }
  });

  useEffect(() => {
    trackMountCount();
    return cleanUpMountCount;
  }, []);

  return children;
};
