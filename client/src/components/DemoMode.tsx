import React from 'react';

const DemoMode: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 text-blue-500 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎵 Crates - Demo Mode
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Welcome to Crates! This is a demo version showcasing the music collection manager.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🎼 Music Collection Features
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Browse and search your vinyl collection</li>
                <li>• Add albums from Discogs database</li>
                <li>• Enhanced metadata with Spotify integration</li>
                <li>• Track BPM and audio features</li>
                <li>• Beautiful, responsive interface</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                🔧 Technical Stack
              </h3>
              <ul className="space-y-2 text-green-800">
                <li>• React + TypeScript frontend</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Node.js + Express backend</li>
                <li>• MongoDB database</li>
                <li>• Spotify, Discogs, GetSongBPM APIs</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Demo Mode Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a demo version running on GitHub Pages. To use the full application with authentication, 
                    database features, and API integrations, you'll need to run the backend server locally or deploy it to a hosting service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Get Started
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                To run the full application locally:
              </p>
              <div className="bg-gray-100 rounded-lg p-4 text-left max-w-md mx-auto">
                <code className="text-sm text-gray-800">
                  <div># Clone the repository</div>
                  <div>git clone https://github.com/CodyLHart/crates.git</div>
                  <div>cd crates</div>
                  <div></div>
                  <div># Start the backend server</div>
                  <div>cd server && npm install && npm start</div>
                  <div></div>
                  <div># Start the frontend</div>
                  <div>cd client && npm install && npm run dev</div>
                </code>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-500">
                Built with ❤️ by Cody Hart
              </div>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/CodyLHart/crates" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View on GitHub
                </a>
                <a 
                  href="https://getsongbpm.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Powered by GetSongBPM
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;
