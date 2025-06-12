import React, { useState } from 'react';
import FieldManagement from './FieldManagement'; // Updated import path
import TagManagement from './TagManagement'; // Updated import path
import TestUpload from './TestUpload'; // We'll create this component

enum AdminTab {
  FIELDS = 'FIELDS',
  TAGS = 'TAGS',
  TEST = 'TEST',
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.FIELDS);

  const renderTabContent = () => {
    switch (activeTab) {
      case AdminTab.FIELDS:
        return <FieldManagement />;
      case AdminTab.TAGS:
        return <TagManagement />;
      case AdminTab.TEST:
        return <TestUpload />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:p-8 max-w-7xl">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 text-center">
        Admin Dashboard
      </h2>
      
      <div className="mb-6 border-b border-gray-300 overflow-x-auto">
        <nav className="flex flex-nowrap min-w-full md:min-w-0 -mb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab(AdminTab.FIELDS)}
            role="tab"
            aria-selected={activeTab === AdminTab.FIELDS}
            className={`whitespace-nowrap py-2 md:py-3 px-3 md:px-4 border-b-2 font-medium text-sm flex-1 md:flex-none
              ${activeTab === AdminTab.FIELDS 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <span className="hidden md:inline">Extraction Fields</span>
            <span className="md:hidden">Fields</span>
          </button>
          <button
            onClick={() => setActiveTab(AdminTab.TAGS)}
            role="tab"
            aria-selected={activeTab === AdminTab.TAGS}
            className={`whitespace-nowrap py-2 md:py-3 px-3 md:px-4 border-b-2 font-medium text-sm flex-1 md:flex-none
              ${activeTab === AdminTab.TAGS 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <span className="hidden md:inline">Predefined Tags</span>
            <span className="md:hidden">Tags</span>
          </button>
          <button
            onClick={() => setActiveTab(AdminTab.TEST)}
            role="tab"
            aria-selected={activeTab === AdminTab.TEST}
            className={`whitespace-nowrap py-2 md:py-3 px-3 md:px-4 border-b-2 font-medium text-sm flex-1 md:flex-none
              ${activeTab === AdminTab.TEST 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <span className="hidden md:inline">Test Resume Upload</span>
            <span className="md:hidden">Test</span>
          </button>
        </nav>
      </div>

      <div className="bg-white md:bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm md:shadow-inner min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
