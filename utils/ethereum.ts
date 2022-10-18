import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export const getEthereum = (): MetaMaskInpageProvider | null => {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    return window.ethereum;
  }
  return null;
};
