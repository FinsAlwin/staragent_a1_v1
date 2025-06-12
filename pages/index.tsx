import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Login from '@/components/auth/Login';
import Navbar from '@/components/layout/Navbar';
import ResumeUploadForm from '@/components/resume/ResumeUploadForm';
import AdminPanel from '@/components/admin/AdminPanel';
import { UserRole } from '../types';
import Head from 'next/head';
import { APP_NAME } from '../constants';

const HomePage: React.FC = () => {
  const { state } = useAppContext();
  const { currentUser } = state;
  const [isAdminView, setIsAdminView] = useState(false);

  if (!currentUser) {
    return (
      <>
        <Head>
          <title>Login - {APP_NAME}</title>
        </Head>
        <Login />
      </>
    );
  }

  const navigateToAdmin = () => setIsAdminView(true);
  const navigateToHome = () => setIsAdminView(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{isAdminView ? `Admin - ${APP_NAME}` : APP_NAME}</title>
      </Head>
      <Navbar 
        onNavigateToAdmin={navigateToAdmin} 
        onNavigateToHome={navigateToHome}
        isAdminView={isAdminView}
      />
      <main className="py-8 px-2 md:px-4">
        {currentUser.role === UserRole.ADMIN && isAdminView ? (
          <AdminPanel />
        ) : (
          <ResumeUploadForm />
        )}
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        {APP_NAME} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default HomePage;
