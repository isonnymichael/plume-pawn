// lib/chains.ts
import { defineChain } from 'thirdweb/chains';

export const plumeTestnet = defineChain({
  id: 98867,
  name: "Plume Network Testnet",
  rpc: "https://testnet-rpc.plumenetwork.xyz",
  nativeCurrency: { 
    name: "PLUME", 
    symbol: "$PLUME", 
    decimals: 18 
  },
  blockExplorers: [{
    name: "Plume Explorer",
    url: "https://testnet-explorer.plumenetwork.xyz"
  }],
});

export const chain = {
  plumeTestnet
};