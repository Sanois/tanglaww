import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export const useConnectivityCheck = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected;
      const reachable = state.isInternetReachable;

      const online =
        connected === true && (reachable === null || reachable === true);

      setIsOnline(online);
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    return unsubscribe;
  }, []);

  return isOnline;
};
