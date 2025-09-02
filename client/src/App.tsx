import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DemoMode from "./components/DemoMode";
import { isBackendAvailable } from "./config/api";

const App: React.FC = () => {
  // Show demo mode if backend is not available (production without backend)
  if (!isBackendAvailable()) {
    return <DemoMode />;
  }

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
