import { useEffect, useState } from "react";
import { getEthereum } from "../utils/ethereum";

type ReturnUseWallet = {
  currentAccount: string | undefined;
  connectWallet: () => void;
};

export const useWallet = (): ReturnUseWallet => {
  const [currentAccount, setCurrentAccount] = useState<string>();
  const ethereum = getEthereum();

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("plz install metamask in your browser");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!Array.isArray(accounts)) {
        console.log("accounts is not array");
        return;
      }

      console.log("connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        console.log("make sure you have meta mask");
        return;
      } else {
        console.log("we have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (!Array.isArray(accounts)) {
        console.log("accounts is not array");
        return;
      }
      if (accounts.length === 0) {
        console.log("no authorized account found");
        return;
      }

      const account = accounts[0];
      console.log("found an authorized account: ", account);
      setCurrentAccount(account);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { currentAccount, connectWallet };
};
