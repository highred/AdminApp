import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, ClipboardListIcon, SchoolIcon, BookOpenIcon, CpuChipIcon, AcademicCapIcon, EyeIcon, ArrowTrendingUpIcon, ChatIcon, ChatBubbleIcon, BriefcaseIcon, CogIcon, ChevronsLeftIcon } from '../icons/Icons';
import { useAppContext } from '../../hooks/useAppContext';
import { programToSlug } from '../../constants';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { programs, isSidebarCollapsed, toggleSidebar } = useAppContext();
  const searchParams = new URLSearchParams(location.search);
  const currentProgramSlug = searchParams.get('program');

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors ${ isSidebarCollapsed ? 'justify-center' : ''} ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  const programIcons = [BookOpenIcon, CpuChipIcon, AcademicCapIcon, EyeIcon, ArrowTrendingUpIcon, ChatBubbleIcon, BriefcaseIcon];

  return (
    <div className={`bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'justify-center px-4'}`}>
        <SchoolIcon className="h-8 w-8 text-primary" />
        {!isSidebarCollapsed && <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Admin Hub</span>}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" className={navLinkClasses} title="Dashboard">
          <HomeIcon className={`h-5 w-5 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
          {!isSidebarCollapsed && 'Dashboard'}
        </NavLink>
        <NavLink to="/requests" className={navLinkClasses} end title="Work Requests">
          <ClipboardListIcon className={`h-5 w-5 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
          {!isSidebarCollapsed && 'Work Requests'}
        </NavLink>
        <NavLink to="/chatbot" className={navLinkClasses} title="AI Chatbot">
            <ChatIcon className={`h-5 w-5 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
            {!isSidebarCollapsed && 'AI Chatbot'}
        </NavLink>
        <NavLink to="/admin" className={navLinkClasses} title="Admin">
            <CogIcon className={`h-5 w-5 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
            {!isSidebarCollapsed && 'Admin'}
        </NavLink>

        <div className={`!mt-6 mb-2 ${isSidebarCollapsed ? 'text-center' : 'px-2'}`}>
            <span className={`text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${isSidebarCollapsed ? 'hidden' : ''}`}>Programs</span>
             <hr className={`dark:border-gray-600 ${!isSidebarCollapsed ? 'hidden' : 'mx-auto w-8'}`} />
        </div>
        
        {programs.map((program, index) => {
            const Icon = programIcons[index % programIcons.length];
            const slug = programToSlug(program.name);
            const isActive = location.pathname === '/requests' && currentProgramSlug === slug;
            return (
                <NavLink key={program.id} to={`/requests?program=${slug}`} className={navLinkClasses({isActive})} title={program.name}>
                    <Icon className={`h-5 w-5 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
                    {!isSidebarCollapsed && program.name}
                </NavLink>
            );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={toggleSidebar} className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 mb-4">
              <ChevronsLeftIcon className={`h-5 w-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <img className="h-10 w-10 rounded-full" src="https://picsum.photos/seed/admin/200" alt="Admin"/>
              {!isSidebarCollapsed && (
                <div className="ml-3">
                    <p className="font-medium text-gray-800 dark:text-white">Admin User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Program Administrator</p>
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Sidebar;