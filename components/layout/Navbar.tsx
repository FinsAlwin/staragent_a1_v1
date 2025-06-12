import React from 'react';
import { useAppContext } from '@/context/AppContext'; // Updated import path
import { UserRole } from '../../types'; // Updated import path
import { APP_NAME } from '../../constants'; // Updated import path

interface NavbarProps {
  onNavigateToAdmin?: () => void;
  onNavigateToHome?: () => void;
  isAdminView: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigateToAdmin, onNavigateToHome, isAdminView }) => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
        <div className="flex items-center space-x-4">
          {currentUser && (
            <span className="text-sm">
              Logged in as: <span className="font-semibold">{currentUser.username} ({currentUser.role})</span>
            </span>
          )}
          {currentUser?.role === UserRole.ADMIN && onNavigateToAdmin && onNavigateToHome && (
            isAdminView ? (
                 <button
                onClick={onNavigateToHome}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                Resume Analyzer
                </button>
            ) : (
                <button
                onClick={onNavigateToAdmin}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                Admin Panel
                </button>
            )
          )}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
