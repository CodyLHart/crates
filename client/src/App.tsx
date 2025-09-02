import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full p-6">
        <Navbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
export default App;
