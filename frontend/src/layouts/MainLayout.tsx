import React from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
    </div>
  )
}

export default MainLayout
