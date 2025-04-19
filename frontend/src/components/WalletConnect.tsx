import { useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import useAuthStore from '../stores/authStore';
import { plumeTestnet } from '../lib/chain';


const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error("THIRDWEB_CLIENT_ID is not defined");
}

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