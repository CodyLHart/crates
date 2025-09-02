import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              <span className="text-lg font-semibold text-gray-900">
                Crates
              </span>
            </div>
            <p className="text-sm text-gray-600">Music Collection Manager</p>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <div className="text-sm text-gray-600">
              <span>Powered by </span>
              <a
                href="https://getsongbpm.com"
                target="_blank"
                rel="noopener"
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors underline"
              >
                GetSongBPM
              </a>
              <span>, </span>
              <a
                href="https://discogs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Discogs
              </a>
              <span>, and </span>
              <a
                href="https://spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Spotify
              </a>
            </div>

            <div className="text-xs text-gray-500">
              © 2024 Crates. Built with React & TypeScript.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
