import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Login from '../features/auth/Login';
import Dashboard from '../features/dashboard/Dashboard';
import Projects from '../features/projects/Projects';
import ProjectOverview from '../features/projects/submodules/ProjectOverview';
import ProjectDetail from '../features/projects/ProjectDetail';
import GanttPage from '../features/gantt/GanttPage';
import UsersPage from '../features/users/Users';
import Notifications from '../features/notifications/Notifications';
import ExportPage from '../features/export/ExportPage';
import SettingsPage from '../features/settings/Settings';
import HelpPage from '../features/help/Help';

// 懒加载项目子模块组件
import { lazy, Suspense } from 'react';
const ProjectResources = lazy(() => import('../features/projects/submodules/ProjectResources'));
const ProjectPlanning = lazy(() => import('../features/projects/submodules/ProjectPlanning'));
const ProjectRisks = lazy(() => import('../features/projects/submodules/ProjectRisks'));
const ProjectCommunication = lazy(() => import('../features/projects/submodules/ProjectCommunication'));
const ProjectRequirements = lazy(() => import('../features/projects/submodules/ProjectRequirements'));
const ProjectDevelopment = lazy(() => import('../features/projects/submodules/ProjectDevelopment'));
const ProjectTesting = lazy(() => import('../features/projects/submodules/ProjectTesting'));
const ProjectConfiguration = lazy(() => import('../features/projects/submodules/ProjectConfiguration'));
const ProjectDrill = lazy(() => import('../features/projects/submodules/ProjectDrill'));
const ProjectDeployment = lazy(() => import('../features/projects/submodules/ProjectDeployment'));
const ProjectWorkRecords = lazy(() => import('../features/projects/submodules/ProjectWorkRecords'));

const SuspenseLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    加载中...
  </div>
);

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
      { path: 'projects/:id', element: <ProjectOverview /> },
      { path: 'projects/:id/tasks', element: <ProjectDetail /> },
      { 
        path: 'projects/:id/resources', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectResources />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/planning', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectPlanning />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/risks', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectRisks />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/communication', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectCommunication />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/requirements', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectRequirements />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/development', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectDevelopment />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/testing', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectTesting />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/configuration', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectConfiguration />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/drill', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectDrill />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/deployment', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectDeployment />
          </Suspense>
        ) 
      },
      { 
        path: 'projects/:id/work-records', 
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProjectWorkRecords />
          </Suspense>
        ) 
      },
      { path: 'gantt', element: <GanttPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'export', element: <ExportPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'help', element: <HelpPage /> },
    ],
  },
]);