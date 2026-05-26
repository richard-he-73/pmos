import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Login from '../features/auth/Login';
import Dashboard from '../features/dashboard/Dashboard';
import Projects from '../features/projects/Projects';
import ProjectDetail from '../features/projects/ProjectDetail';
import Resources from '../features/resources/Resources';
import Risks from '../features/risks/Risks';
import Requirements from '../features/requirements/Requirements';
import Development from '../features/development/Development';
import Testing from '../features/testing/Testing';
import GanttPage from '../features/gantt/GanttPage';
import PlanningPage from '../features/planning/PlanningPage';
import UsersPage from '../features/users/Users';
import Notifications from '../features/notifications/Notifications';
import CommunicationPage from '../features/communication/Communication';
import ConfigurationPage from '../features/configuration/Configuration';
import DrillPage from '../features/drill/DrillPage';
import DeploymentPage from '../features/deployment/DeploymentPage';
import WorkPage from '../features/work/WorkPage';
import ExportPage from '../features/export/ExportPage';
import SettingsPage from '../features/settings/Settings';
import HelpPage from '../features/help/Help';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'resources', element: <Resources /> },
      { path: 'planning', element: <PlanningPage /> },
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
      { path: 'users', element: <UsersPage /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'export', element: <ExportPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'help', element: <HelpPage /> },
    ],
  },
]);
