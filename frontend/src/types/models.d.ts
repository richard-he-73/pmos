export interface User {
  _id: string;
  username: string;
  email: string;
  display_name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Project {
  _id: string;
  code: string;
  name: string;
  description: string;
  owner_id: string;
  stakeholders: string[];
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date?: string;
  budget: {
    total: number;
    used: number;
    currency: string;
  };
  progress: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  _id: string;
  project_id: string;
  parent_task_id?: string;
  title: string;
  description: string;
  assignee_id?: string;
  reporter_id: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'feature' | 'bug' | 'task' | 'milestone';
  estimate_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  dependencies: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Resource {
  _id: string;
  name: string;
  type: 'human' | 'equipment' | 'budget';
  category: string;
  capacity: number;
  allocated: number;
  availability: 'available' | 'busy' | 'unavailable';
  skills?: string[];
  cost_per_hour?: number;
  created_at: string;
  updated_at: string;
}

export interface Risk {
  _id: string;
  project_id: string;
  title: string;
  description: string;
  category: 'technical' | 'schedule' | 'budget' | 'resource' | 'external';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  severity: number;
  status: 'identified' | 'assessed' | 'mitigating' | 'closed';
  owner_id: string;
  mitigation_plan: string;
  contingency_plan?: string;
  created_at: string;
  updated_at: string;
}

export interface Requirement {
  _id: string;
  project_id: string;
  code: string;
  title: string;
  description: string;
  type: 'functional' | 'non_functional' | 'business' | 'technical';
  status: 'draft' | 'reviewing' | 'approved' | 'in_progress' | 'done' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  acceptance_criteria: string[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleInfo {
  name: string;
  icon: string;
  stat: string;
  statLabel: string;
  status: string;
  statusClass: string;
  color: string;
  path: string;
}
