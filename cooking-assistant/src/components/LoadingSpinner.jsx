// src/components/LoadingSpinner.jsx
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-center">
          <p className="text-gray-600 font-medium">Loading delicious recipes...</p>
        </div>
      </div>
    </div>
  );
}
