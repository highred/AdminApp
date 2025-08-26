import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, ClipboardListIcon, SchoolIcon, BookOpenIcon, CpuChipIcon, AcademicCapIcon, EyeIcon, ArrowTrendingUpIcon, ChatIcon, ChatBubbleIcon, BriefcaseIcon, CogIcon, ChevronsLeftIcon, FireIcon } from '../icons/Icons';
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
    
  const programNavLinkClasses = (slug: string): string =>
    `flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors ${ isSidebarCollapsed ? 'justify-center' : ''} ${
      currentProgramSlug === slug
        ? 'bg-primary text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  const programIcons = [BookOpenIcon, CpuChipIcon, AcademicCapIcon, EyeIcon, ArrowTrendingUpIcon, ChatBubbleIcon, BriefcaseIcon];

  return (
    <div className={`bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4 flex-shrink-0 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-4'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
           <SchoolIcon className="h-7 w-7 text-primary" />
           {!isSidebarCollapsed && <span className="ml-2 text-lg font-bold text-gray-800 dark:text-white">Admin Hub</span>}
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <NavLink to="/dashboard" className={navLinkClasses}>
          <HomeIcon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
          {!isSidebarCollapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink to="/hotlist" className={navLinkClasses}>
          <FireIcon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
          {!isSidebarCollapsed && <span>Daily Hotlist</span>}
        </NavLink>
        <NavLink to="/requests" end className={({isActive}) => navLinkClasses({isActive: isActive && !currentProgramSlug})}>
          <ClipboardListIcon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
          {!isSidebarCollapsed && <span>All Requests</span>}
        </NavLink>

        <div className="pt-4">
          <h3 className={`px-4 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            Programs
          </h3>
          <div className="mt-2 space-y-1">
            {programs.map((program, index) => {
              const Icon = programIcons[index % programIcons.length];
              const slug = programToSlug(program.name);
              return (
                <NavLink
                  key={program.id}
                  to={`/requests?program=${slug}`}
                  className={programNavLinkClasses(slug)}
                  title={program.name}
                >
                  <Icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{program.name}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
         <NavLink to="/chatbot" className={navLinkClasses}>
          <ChatIcon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
          {!isSidebarCollapsed && <span>AI Assistant</span>}
        </NavLink>
        <NavLink to="/admin" className={navLinkClasses}>
          <CogIcon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
          {!isSidebarCollapsed && <span>Admin Settings</span>}
        </NavLink>
         <button onClick={toggleSidebar} className={`w-full mt-2 flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <ChevronsLeftIcon className={`h-5 w-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''} ${isSidebarCollapsed ? '' : 'mr-3'}`} />
          {!isSidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
