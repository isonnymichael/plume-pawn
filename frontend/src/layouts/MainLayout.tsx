import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const titleMap: Record<string, string> = {
      "/": "Pinjam | Decentralized Digital Pawnshop",
      "/dashboard": "Pinjam | Dashboard",
      "/rwa": "Pinjam | RWA",
      "/marketplace": "Pinjam | Marketplace",
    };

    document.title = titleMap[location.pathname] || "Pinjam";
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
