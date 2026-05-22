import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * Temporary debugging component to display tenant login errors
 * This will help us see what's causing the immediate logout
 */
const TenantErrorDisplay = () => {
  const [error, setError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  useEffect(() => {
    // Check for errors every 100ms
    const interval = setInterval(() => {
      if (window.TENANT_LOGIN_ERROR) {
        setError(window.TENANT_LOGIN_ERROR);
        console.log('🔴 DISPLAYING TENANT ERROR:', window.TENANT_LOGIN_ERROR);
      }
      if (window.TENANT_REFRESH_ERROR) {
        setRefreshError(window.TENANT_REFRESH_ERROR);
        console.log('🔴 DISPLAYING REFRESH ERROR:', window.TENANT_REFRESH_ERROR);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!error && !refreshError) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="bg-red-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <h2 className="text-xl font-bold">Tenant Login Error Detected</h2>
          </div>
          <button
            onClick={() => {
              setError(null);
              setRefreshError(null);
              window.TENANT_LOGIN_ERROR = null;
              window.TENANT_REFRESH_ERROR = null;
            }}
            className="hover:bg-red-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              ⚠️ This is a debugging screen. The tenant login is failing immediately.
            </p>
            <p className="text-xs text-yellow-700">
              Please copy the error details below and share with the developer.
            </p>
          </div>

          {error && (
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-gray-900">Initial Error:</h3>
              <div className="bg-gray-100 rounded p-4 font-mono text-xs overflow-auto">
                <pre>{JSON.stringify(error, null, 2)}</pre>
              </div>
            </div>
          )}

          {refreshError && (
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-gray-900">Token Refresh Error:</h3>
              <div className="bg-gray-100 rounded p-4 font-mono text-xs overflow-auto">
                <pre>{JSON.stringify(refreshError, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-900">Debugging Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Check if the token is being saved to localStorage</li>
              <li>Check if the refresh token cookie is being set</li>
              <li>Verify the API endpoint is correct: {import.meta.env.VITE_API_URL}</li>
              <li>Check backend logs for authentication errors</li>
              <li>Verify tenant role is allowed in backend auth middleware</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const errorText = JSON.stringify({ error, refreshError }, null, 2);
                navigator.clipboard.writeText(errorText);
                alert('Error details copied to clipboard!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Copy Error Details
            </button>
            <button
              onClick={() => {
                console.log('🔍 FULL ERROR DETAILS:', { error, refreshError });
                console.log('🔍 LOCALSTORAGE TOKEN:', localStorage.getItem('token'));
                console.log('🔍 LOCALSTORAGE ROLE:', localStorage.getItem('role'));
                console.log('🔍 LOCALSTORAGE USER:', localStorage.getItem('user'));
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
            >
              Log Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantErrorDisplay;
