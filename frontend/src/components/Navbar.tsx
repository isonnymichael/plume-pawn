import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center font-sans fixed w-full top-0 z-50">
      <Link to="/" className="text-red-500 text-xl font-bold">Pinjam</Link>
      <div>
        <WalletConnect />
      </div>
    </nav>
  );
};

export default Navbar;
