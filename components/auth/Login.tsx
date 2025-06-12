import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext'; // Updated import path
import { UserRole } from '../../types'; // Updated import path
import { MOCK_USERS, APP_NAME } from '../../constants'; // Updated import path

const Login: React.FC = () => {
  const { dispatch } = useAppContext();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === UserRole.ADMIN) {
      dispatch({ type: 'LOGIN', payload: MOCK_USERS.admin });
    } else {
      dispatch({ type: 'LOGIN', payload: MOCK_USERS.user });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400 mb-2">
          {APP_NAME}
        </h1>
        <p className="text-center text-gray-600 mb-8">Welcome! Please select your role to continue.</p>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Select Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value={UserRole.USER}>User</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-150 transform hover:-translate-y-0.5"
          >
            Login as {selectedRole === UserRole.ADMIN ? 'Admin' : 'User'}
          </button>
        </form>
         <p className="mt-6 text-xs text-gray-500 text-center">
          This is a mock authentication. No actual credentials are used.
        </p>
      </div>
    </div>
  );
};

export default Login;
