import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThirdwebClient } from 'thirdweb';
import { ConnectButton, useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
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
  const navigate = useNavigate();
  const { login, logout, setAddress } = useAuthStore();
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

  useEffect(() => {
    if (account) {
      if (chain?.id === plumeTestnet.id) {
        login(account.address);
        setAddress(account.address);
      } else {
        logout();
        setAddress(null);
        navigate('/');
      }
    } else {
      logout();
      setAddress(null);
    }
  }, [account, chain, login, logout, setAddress, navigate]);

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