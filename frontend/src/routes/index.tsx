import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import Login from '../features/auth/Login';
import Dashboard from '../features/dashboard/Dashboard';
import Projects from '../features/projects/Projects';
import ProjectDetail from '../features/projects/ProjectDetail';
import Tasks from '../features/tasks/Tasks';
import Risks from '../features/risks/Risks';
import Requirements from '../features/requirements/Requirements';
import Development from '../features/development/Development';
import Testing from '../features/testing/Testing';
import GanttPage from '../features/gantt/GanttPage';
import Permissions from '../features/permissions/Permissions';
import Notifications from '../features/notifications/Notifications';
import CommunicationPage from '../features/communication/Communication';
import ConfigurationPage from '../features/configuration/Configuration';
import DrillPage from '../features/drill/DrillPage';
import DeploymentPage from '../features/deployment/DeploymentPage';
import WorkPage from '../features/work/WorkPage';
import ExportPage from '../features/export/ExportPage';

import Phase2Modules from '../features/modules/Phase2Modules';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'resources', element: <Phase2Modules defaultModule="resources" /> },
      { path: 'planning', element: <GanttPage /> },
      { path: 'gantt', element: <GanttPage /> },
      { path: 'risks', element: <Risks /> },
      { path: 'communication', element: <CommunicationPage /> },
      { path: 'requirements', element: <Requirements /> },
      { path: 'development', element: <Development /> },
      { path: 'testing', element: <Testing /> },
      { path: 'configuration', element: <ConfigurationPage /> },
      { path: 'drill', element: <DrillPage /> },
      { path: 'deployment', element: <DeploymentPage /> },
      { path: 'work', element: <WorkPage /> },
      { path: 'users', element: <Permissions /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'export', element: <ExportPage /> },
      { path: 'settings', element: <div className="page-placeholder">系统设置</div> },
      { path: 'help', element: <div className="page-placeholder">帮助中心</div> },
    ],
  },
]);
