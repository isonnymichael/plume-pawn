import { useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { defineChain } from 'thirdweb/chains';
import useAuthStore from '../stores/authStore';

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error("THIRDWEB_CLIENT_ID is not defined");
}

// Chain definition
const plumeTestnet = defineChain({
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

const client = createThirdwebClient({ clientId });
const wallets = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
];

const WalletConnect = () => {
  const { login, logout, setAddress } = useAuthStore();
  const account = useActiveAccount();

  useEffect(() => {
    if (account) {
      login(account.address);
      setAddress(account.address);
    } else {
      logout();
      setAddress(null);
    }
  }, [account, login, logout, setAddress]);

  return (
    <div>
      <ConnectButton
        client={client}
        wallets={wallets}
        chain={plumeTestnet}
        connectModal={{ size: 'compact' }}
      />
    </div>
  );
};

export default WalletConnect;