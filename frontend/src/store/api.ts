import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_PREFIX } from '../utils/constants';

const baseQuery = fetchBaseQuery({
  baseUrl: API_PREFIX,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // 清除本地存储并刷新页面到登录页
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Projects', 'Tasks', 'Resources', 'Risks', 'Notifications', 'Stats',
    'Requirements', 'Development', 'Testing', 'Permissions',
    'Configuration', 'Users', 'Communication', 'Export',
    'DataDictionaries'
  ],
  endpoints: (builder) => ({
    // Projects
    getProjects: builder.query({
      query: (_: void): string => '/projects',
      providesTags: ['Projects'],
    }),
    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: ['Projects'],
    }),
    createProject: builder.mutation({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation({
      query: ({ id, body }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
    cloneProject: builder.mutation({
      query: ({ id, body }) => ({
        url: `/projects/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    addTeamMember: builder.mutation({
      query: ({ projectId, memberId }) => ({
        url: `/projects/${projectId}/team-members`,
        method: 'POST',
        body: { member_id: memberId },
      }),
      invalidatesTags: ['Projects'],
    }),
    removeTeamMember: builder.mutation({
      query: ({ projectId, memberId }) => ({
        url: `/projects/${projectId}/team-members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjectStatusFlow: builder.query({
      query: (projectId) => `/projects/${projectId}/status-flow`,
      providesTags: ['Projects'],
    }),
    transitionProjectStatus: builder.mutation({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/status-transition`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    setDefaultProject: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: ['Projects'],
    }),
    getDefaultProject: builder.query({
      query: (_: void): string => '/projects/default',
      providesTags: ['Projects'],
    }),
    
    // Tasks
    getTasks: builder.query({
      query: ({ project_id, status_filter, priority }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        if (priority) params.append('priority', priority);
        const queryString = params.toString();
        return `/tasks${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Tasks'],
    }),
    getTask: builder.query({
      query: (id) => `/tasks/${id}`,
      providesTags: ['Tasks'],
    }),
    createTask: builder.mutation({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),
    updateTask: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),
    getTaskDependencies: builder.query({
      query: (taskId) => `/tasks/${taskId}/dependencies`,
      providesTags: ['Tasks'],
    }),
    addTaskDependency: builder.mutation({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/dependencies`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),
    removeTaskDependency: builder.mutation({
      query: ({ taskId, dependencyId }) => ({
        url: `/tasks/${taskId}/dependencies/${dependencyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),
    
    // Resources
    getResources: builder.query({
      query: ({ type, availability }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (availability) params.append('availability', availability);
        const queryString = params.toString();
        return `/resources${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Resources'],
    }),
    getResource: builder.query({
      query: (id) => `/resources/${id}`,
      providesTags: ['Resources'],
    }),
    createResource: builder.mutation({
      query: (body) => ({
        url: '/resources',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Resources'],
    }),
    updateResource: builder.mutation({
      query: ({ id, body }) => ({
        url: `/resources/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Resources'],
    }),
    deleteResource: builder.mutation({
      query: (id) => ({
        url: `/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Resources'],
    }),
    checkResourceConflicts: builder.query({
      query: () => '/resources/conflicts',
    }),
    
    // Risks
    getRisks: builder.query({
      query: ({ project_id, status }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status) params.append('status', status);
        const queryString = params.toString();
        return `/risks${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Risks'],
    }),
    getRisk: builder.query({
      query: (id) => `/risks/${id}`,
      providesTags: ['Risks'],
    }),
    createRisk: builder.mutation({
      query: (body) => ({
        url: '/risks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Risks'],
    }),
    updateRisk: builder.mutation({
      query: ({ id, body }) => ({
        url: `/risks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Risks'],
    }),
    deleteRisk: builder.mutation({
      query: (id) => ({
        url: `/risks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Risks'],
    }),
    
    // Requirements
    getRequirements: builder.query({
      query: ({ project_id }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        const queryString = params.toString();
        return `/requirements${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Requirements'],
    }),
    getRequirement: builder.query({
      query: (id) => `/requirements/${id}`,
      providesTags: ['Requirements'],
    }),
    createRequirement: builder.mutation({
      query: (body) => ({
        url: '/requirements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Requirements'],
    }),
    updateRequirement: builder.mutation({
      query: ({ id, body }) => ({
        url: `/requirements/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Requirements'],
    }),
    deleteRequirement: builder.mutation({
      query: (id) => ({
        url: `/requirements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Requirements'],
    }),
    
    // Development - Iterations
    getIterations: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return `/development/iterations${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Development'],
    }),
    getIteration: builder.query({
      query: (id) => `/development/iterations/${id}`,
      providesTags: ['Development'],
    }),
    createIteration: builder.mutation({
      query: (body) => ({
        url: '/development/iterations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Development'],
    }),
    updateIteration: builder.mutation({
      query: ({ id, body }) => ({
        url: `/development/iterations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Development'],
    }),
    deleteIteration: builder.mutation({
      query: (id) => ({
        url: `/development/iterations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Development'],
    }),
    
    // Development - Code Reviews
    getCodeReviews: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return `/development/code-reviews${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Development'],
    }),
    getCodeReview: builder.query({
      query: (id) => `/development/code-reviews/${id}`,
      providesTags: ['Development'],
    }),
    createCodeReview: builder.mutation({
      query: (body) => ({
        url: '/development/code-reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Development'],
    }),
    updateCodeReview: builder.mutation({
      query: ({ id, body }) => ({
        url: `/development/code-reviews/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Development'],
    }),
    
    // Testing - Test Cases
    getTestCases: builder.query({
      query: ({ project_id, status, module }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status) params.append('status', status);
        if (module) params.append('module', module);
        const queryString = params.toString();
        return `/testing/test-cases${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Testing'],
    }),
    getTestCase: builder.query({
      query: (id) => `/testing/test-cases/${id}`,
      providesTags: ['Testing'],
    }),
    createTestCase: builder.mutation({
      query: (body) => ({
        url: '/testing/test-cases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Testing'],
    }),
    updateTestCase: builder.mutation({
      query: ({ id, body }) => ({
        url: `/testing/test-cases/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Testing'],
    }),
    deleteTestCase: builder.mutation({
      query: (id) => ({
        url: `/testing/test-cases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Testing'],
    }),
    
    // Testing - Defects
    getDefects: builder.query({
      query: ({ project_id, status, severity }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status) params.append('status', status);
        if (severity) params.append('severity', severity);
        const queryString = params.toString();
        return `/testing/defects${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Testing'],
    }),
    getDefect: builder.query({
      query: (id) => `/testing/defects/${id}`,
      providesTags: ['Testing'],
    }),
    createDefect: builder.mutation({
      query: (body) => ({
        url: '/testing/defects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Testing'],
    }),
    updateDefect: builder.mutation({
      query: ({ id, body }) => ({
        url: `/testing/defects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Testing'],
    }),
    deleteDefect: builder.mutation({
      query: (id) => ({
        url: `/testing/defects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Testing'],
    }),
    
    // Testing - Test Reports
    getTestReports: builder.query({
      query: ({ project_id }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        const queryString = params.toString();
        return `/testing/reports${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Testing'],
    }),
    getTestReport: builder.query({
      query: (id) => `/testing/reports/${id}`,
      providesTags: ['Testing'],
    }),
    createTestReport: builder.mutation({
      query: (body) => ({
        url: '/testing/reports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Testing'],
    }),
    updateTestReport: builder.mutation({
      query: ({ id, body }) => ({
        url: `/testing/reports/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Testing'],
    }),
    deleteTestReport: builder.mutation({
      query: (id) => ({
        url: `/testing/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Testing'],
    }),
    
    // Permissions - Roles
    getRoles: builder.query({
      query: (_: void): string => '/permissions/roles',
      providesTags: ['Permissions'],
    }),
    createRole: builder.mutation({
      query: (body) => ({
        url: '/permissions/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Permissions'],
    }),
    updateRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/permissions/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Permissions'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/permissions/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),
    
    // Permissions - Groups
    getGroups: builder.query({
      query: (_: void): string => '/permissions/groups',
      providesTags: ['Permissions'],
    }),
    createGroup: builder.mutation({
      query: (body) => ({
        url: '/permissions/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Permissions'],
    }),
    updateGroup: builder.mutation({
      query: ({ id, body }) => ({
        url: `/permissions/groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Permissions'],
    }),
    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `/permissions/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),
    
    // Permissions - Operation Logs
    getOperationLogs: builder.query({
      query: ({ user_id, action, resource_type }) => {
        const params = new URLSearchParams();
        if (user_id) params.append('user_id', user_id);
        if (action) params.append('action', action);
        if (resource_type) params.append('resource_type', resource_type);
        const queryString = params.toString();
        return `/permissions/logs${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Permissions'],
    }),
    
    // Notifications
    getNotifications: builder.query({
      query: (_: void): string => '/notifications',
      providesTags: ['Notifications'],
    }),
    getUnreadCount: builder.query({
      query: (_: void): string => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: (_: void) => ({
        url: '/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Stats
    getStats: builder.query({
      query: (projectId?: string) => {
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        const queryString = params.toString();
        return `/stats${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    getAlerts: builder.query({
      query: (level?: string) => {
        const params = new URLSearchParams();
        if (level) params.append('level', level);
        const queryString = params.toString();
        return `/stats/alerts${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    createAlert: builder.mutation({
      query: (body) => ({
        url: '/stats/alerts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Stats'],
    }),
    updateAlert: builder.mutation({
      query: ({ alertId, body }) => ({
        url: `/stats/alerts/${alertId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Stats'],
    }),
    getProjectStatusChart: builder.query({
      query: (projectId?: string) => {
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        const queryString = params.toString();
        return `/stats/chart/project-status${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    getTaskPriorityChart: builder.query({
      query: (projectId?: string) => {
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        const queryString = params.toString();
        return `/stats/chart/task-priority${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    getProjectPriorityChart: builder.query({
      query: (projectId?: string) => {
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        const queryString = params.toString();
        return `/stats/chart/project-priority${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    getTaskTrendChart: builder.query({
      query: ({ limit, projectId }: { limit?: number; projectId?: string }) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (projectId) params.append('project_id', projectId);
        const queryString = params.toString();
        return `/stats/chart/task-trend${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    getBudgetUsageChart: builder.query({
      query: (projectId?: string) => {
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        const queryString = params.toString();
        return `/stats/chart/budget-usage${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    getResourceUtilizationChart: builder.query({
      query: (_: void): string => '/stats/chart/resource-utilization',
      providesTags: ['Stats'],
    }),
    getTaskGanttData: builder.query({
      query: ({ project_id }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        const queryString = params.toString();
        return `/stats/gantt/tasks${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Stats'],
    }),
    
    // Configuration - Config Items
    getConfigItems: builder.query({
      query: ({ category }) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        const queryString = params.toString();
        return `/configuration/items${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Configuration'],
    }),
    createConfigItem: builder.mutation({
      query: (body) => ({
        url: '/configuration/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    updateConfigItem: builder.mutation({
      query: ({ id, body }) => ({
        url: `/configuration/items/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    deleteConfigItem: builder.mutation({
      query: (id) => ({
        url: `/configuration/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Configuration'],
    }),
    
    // Configuration - Drills
    getDrills: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return `/configuration/drills${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Configuration'],
    }),
    createDrill: builder.mutation({
      query: (body) => ({
        url: '/configuration/drills',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    updateDrill: builder.mutation({
      query: ({ id, body }) => ({
        url: `/configuration/drills/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    deleteDrill: builder.mutation({
      query: (id) => ({
        url: `/configuration/drills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Configuration'],
    }),
    
    // Configuration - Deployments
    getDeployments: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return `/configuration/deployments${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Configuration'],
    }),
    createDeployment: builder.mutation({
      query: (body) => ({
        url: '/configuration/deployments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    updateDeployment: builder.mutation({
      query: ({ id, body }) => ({
        url: `/configuration/deployments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    deleteDeployment: builder.mutation({
      query: (id) => ({
        url: `/configuration/deployments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Configuration'],
    }),
    
    // Configuration - Work Records
    getWorkRecords: builder.query({
      query: ({ project_id, type_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (type_filter) params.append('type_filter', type_filter);
        const queryString = params.toString();
        return `/configuration/work-records${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Configuration'],
    }),
    createWorkRecord: builder.mutation({
      query: (body) => ({
        url: '/configuration/work-records',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    updateWorkRecord: builder.mutation({
      query: ({ id, body }) => ({
        url: `/configuration/work-records/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Configuration'],
    }),
    deleteWorkRecord: builder.mutation({
      query: (id) => ({
        url: `/configuration/work-records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Configuration'],
    }),
    
    // Users
    getUsers: builder.query({
      query: (_: void): string => '/users',
      providesTags: ['Users'],
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    // Password management
    changePassword: builder.mutation({
      query: (body) => ({
        url: '/users/me/change-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/reset-password`,
        method: 'POST',
        body,
      }),
    }),
    
    // Communications
    getCommunications: builder.query({
      query: ({ project_id, type_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (type_filter) params.append('type_filter', type_filter);
        const queryString = params.toString();
        return `/communications${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Communication'],
    }),
    getCommunication: builder.query({
      query: (id) => `/communications/${id}`,
      providesTags: ['Communication'],
    }),
    createCommunication: builder.mutation({
      query: (body) => ({
        url: '/communications',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Communication'],
    }),
    updateCommunication: builder.mutation({
      query: ({ id, body }) => ({
        url: `/communications/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Communication'],
    }),
    deleteCommunication: builder.mutation({
      query: (id) => ({
        url: `/communications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Communication'],
    }),
    
    // Export
    exportProjectsCSV: builder.query({
      query: ({ status_filter }) => {
        const params = new URLSearchParams();
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return {
          url: `/export/projects/csv${queryString ? `?${queryString}` : ''}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    exportProjectsJSON: builder.query({
      query: ({ status_filter }) => {
        const params = new URLSearchParams();
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return {
          url: `/export/projects/json${queryString ? `?${queryString}` : ''}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    exportTasksCSV: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return {
          url: `/export/tasks/csv${queryString ? `?${queryString}` : ''}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    exportTasksJSON: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return {
          url: `/export/tasks/json${queryString ? `?${queryString}` : ''}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    exportRisksCSV: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return {
          url: `/export/risks/csv${queryString ? `?${queryString}` : ''}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    exportRequirementsCSV: builder.query({
      query: ({ project_id, status_filter }) => {
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (status_filter) params.append('status_filter', status_filter);
        const queryString = params.toString();
        return {
          url: `/export/requirements/csv${queryString ? `?${queryString}` : ''}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    exportSummaryReport: builder.query({
      query: () => ({
        url: '/export/summary/report',
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Authentication
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Data Dictionaries
    getDataDictionaries: builder.query({
      query: (category?: string) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        const queryString = params.toString();
        return `/data-dictionaries${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['DataDictionaries'],
    }),
    getDataDictionary: builder.query({
      query: (id: string) => `/data-dictionaries/${id}`,
      providesTags: ['DataDictionaries'],
    }),
    createDataDictionary: builder.mutation({
      query: (body) => ({
        url: '/data-dictionaries',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DataDictionaries'],
    }),
    updateDataDictionary: builder.mutation({
      query: ({ id, body }) => ({
        url: `/data-dictionaries/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['DataDictionaries'],
    }),
    deleteDataDictionary: builder.mutation({
      query: (id: string) => ({
        url: `/data-dictionaries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DataDictionaries'],
    }),
    initializeDataDictionaries: builder.mutation({
      query: () => ({
        url: '/data-dictionaries/initialize',
        method: 'POST',
      }),
      invalidatesTags: ['DataDictionaries'],
    }),

    // Plans (Milestones, Group Plans, Detail Tasks)
    getMilestones: builder.query({
      query: (projectId) => `/plans/${projectId}/milestones`,
    }),
    getGroupPlans: builder.query({
      query: (projectId) => `/plans/${projectId}/group-plans`,
    }),
    getDetailTasks: builder.query({
      query: (projectId) => `/plans/${projectId}/detail-tasks`,
    }),
  }),
});

export const {
  // Projects
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useCloneProjectMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetProjectStatusFlowQuery,
  useTransitionProjectStatusMutation,
  useSetDefaultProjectMutation,
  useGetDefaultProjectQuery,
  // Tasks
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskDependenciesQuery,
  useAddTaskDependencyMutation,
  useRemoveTaskDependencyMutation,
  // Resources
  useGetResourcesQuery,
  useGetResourceQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useCheckResourceConflictsQuery,
  // Risks
  useGetRisksQuery,
  useGetRiskQuery,
  useCreateRiskMutation,
  useUpdateRiskMutation,
  useDeleteRiskMutation,
  // Requirements
  useGetRequirementsQuery,
  useGetRequirementQuery,
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
  useDeleteRequirementMutation,
  // Development - Iterations
  useGetIterationsQuery,
  useGetIterationQuery,
  useCreateIterationMutation,
  useUpdateIterationMutation,
  useDeleteIterationMutation,
  // Development - Code Reviews
  useGetCodeReviewsQuery,
  useGetCodeReviewQuery,
  useCreateCodeReviewMutation,
  useUpdateCodeReviewMutation,
  // Testing - Test Cases
  useGetTestCasesQuery,
  useGetTestCaseQuery,
  useCreateTestCaseMutation,
  useUpdateTestCaseMutation,
  useDeleteTestCaseMutation,
  // Testing - Defects
  useGetDefectsQuery,
  useGetDefectQuery,
  useCreateDefectMutation,
  useUpdateDefectMutation,
  useDeleteDefectMutation,
  // Testing - Test Reports
  useGetTestReportsQuery,
  useGetTestReportQuery,
  useCreateTestReportMutation,
  useUpdateTestReportMutation,
  useDeleteTestReportMutation,
  // Permissions - Roles
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  // Permissions - Groups
  useGetGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  // Permissions - Operation Logs
  useGetOperationLogsQuery,
  // Notifications
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  // Stats
  useGetStatsQuery,
  useGetAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useGetProjectStatusChartQuery,
  useGetTaskPriorityChartQuery,
  useGetProjectPriorityChartQuery,
  useGetTaskTrendChartQuery,
  useGetBudgetUsageChartQuery,
  useGetResourceUtilizationChartQuery,
  useGetTaskGanttDataQuery,
  // Configuration - Config Items
  useGetConfigItemsQuery,
  useCreateConfigItemMutation,
  useUpdateConfigItemMutation,
  useDeleteConfigItemMutation,
  // Configuration - Drills
  useGetDrillsQuery,
  useCreateDrillMutation,
  useUpdateDrillMutation,
  useDeleteDrillMutation,
  // Configuration - Deployments
  useGetDeploymentsQuery,
  useCreateDeploymentMutation,
  useUpdateDeploymentMutation,
  useDeleteDeploymentMutation,
  // Configuration - Work Records
  useGetWorkRecordsQuery,
  useCreateWorkRecordMutation,
  useUpdateWorkRecordMutation,
  useDeleteWorkRecordMutation,
  // Users
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  // Communications
  useGetCommunicationsQuery,
  useGetCommunicationQuery,
  useCreateCommunicationMutation,
  useUpdateCommunicationMutation,
  useDeleteCommunicationMutation,
  // Export
  useExportProjectsCSVQuery,
  useExportProjectsJSONQuery,
  useExportTasksCSVQuery,
  useExportTasksJSONQuery,
  useExportRisksCSVQuery,
  useExportRequirementsCSVQuery,
  useExportSummaryReportQuery,
  // Authentication
  useLoginMutation,
  useRegisterMutation,
  // Data Dictionaries
  useGetDataDictionariesQuery,
  useGetDataDictionaryQuery,
  useCreateDataDictionaryMutation,
  useUpdateDataDictionaryMutation,
  useDeleteDataDictionaryMutation,
  useInitializeDataDictionariesMutation,
  // Plans
  useGetMilestonesQuery,
  useGetGroupPlansQuery,
  useGetDetailTasksQuery,
} = apiSlice;
