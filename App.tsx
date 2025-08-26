import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileHeader from './components/layout/MobileHeader';
import Dashboard from './components/pages/Dashboard';
import WorkRequests from './components/pages/WorkRequests';
import SchoolProfile from './components/pages/SchoolProfile';
import AIChatbot from './components/pages/AIChatbot';
import Admin from './components/pages/Admin';
import { useAppContext } from './hooks/useAppContext';
import useMediaQuery from './hooks/useMediaQuery';

const App: React.FC = () => {
  const { zoomLevel } = useAppContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const getZoomClass = () => {
    switch (zoomLevel) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  if (isMobile) {
    return (
       <div className={`flex flex-col h-screen bg-light-bg dark:bg-dark-bg ${getZoomClass()}`}>
        <MobileHeader />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<WorkRequests />} />
            <Route path="/chatbot" element={<AIChatbot />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/schools/:schoolId" element={<SchoolProfile />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-light-bg dark:bg-dark-bg ${getZoomClass()}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 bg-light-bg dark:bg-dark-bg p-6 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<WorkRequests />} />
            <Route path="/chatbot" element={<AIChatbot />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/schools/:schoolId" element={<SchoolProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;