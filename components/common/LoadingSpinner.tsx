import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">Processing...</p>
    </div>
  );
};

export default LoadingSpinner;
