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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-center text-sm">
            Music data powered by <a href="https://getsongbpm.com" target="_blank" rel="noopener" className="font-semibold underline text-blue-900">GetSongBPM.com</a>
          </p>
        </div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
export default App;
