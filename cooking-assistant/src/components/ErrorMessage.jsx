// src/components/ErrorMessage.jsx
import React from "react";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center py-16">
      <div className="text-red-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">Oops! Something Went Wrong</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
