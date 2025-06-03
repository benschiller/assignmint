import { Eip1193Provider } from 'ethers';

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      on?: (eventName: string, listener: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, listener: (...args: any[]) => void) => void;
    };
  }
}
