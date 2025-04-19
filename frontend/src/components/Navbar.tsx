import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center font-sans fixed w-full top-0 z-50">
      <Link to="/" className="text-red-500 text-xl font-bold">Plume Pawn</Link>
      <div>
        <button className="bg-black hover:bg-gray-900 text-white text-sm px-6 py-2 rounded-full cursor-pointer mr-3">
          Connect
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
