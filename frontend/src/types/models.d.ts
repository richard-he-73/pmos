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
  team_members: string[];
  team_members_with_roles?: Array<{
    member_id: string;
    role: string;
    org_node_id?: string;
  }>;
  org_structure?: Array<{
    id: string;
    name: string;
    type: 'department' | 'group' | 'team';
    parent_id?: string;
    leader_id?: string;
    org_level?: string;
    description?: string;
  }>;
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
  is_default?: boolean;
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
  type: 'human' | 'equipment' | 'budget' | 'material' | 'software';
  description?: string;
  category: string;
  capacity: number;
  allocated: number;
  availability: 'available' | 'busy' | 'unavailable';
  skills?: string[];
  tags?: string[];
  cost_per_hour?: number;
  hourly_rate?: number;
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

export interface Iteration {
  _id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  tasks: string[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface CodeReview {
  _id: string;
  project_id: string;
  task_id: string;
  reviewer_id: string;
  author_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  comment: string;
  code_url: string;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  _id: string;
  project_id: string;
  title: string;
  description: string;
  module: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'deprecated';
  preconditions: string;
  steps: string[];
  expected_result: string;
  related_requirement_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Defect {
  _id: string;
  project_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  reporter_id: string;
  assignee_id?: string;
  environment: string;
  steps_to_reproduce: string;
  actual_result: string;
  expected_result: string;
  related_test_case_id?: string;
  related_task_id?: string;
  resolution: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TestReport {
  _id: string;
  project_id: string;
  iteration_id?: string;
  name: string;
  total_cases: number;
  passed: number;
  failed: number;
  blocked: number;
  pass_rate: number;
  defects_found: number;
  summary: string;
  tester_id: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGroup {
  _id: string;
  name: string;
  description: string;
  members: string[];
  parent_group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OperationLog {
  _id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  ip_address: string;
  user_agent: string;
  status: string;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  _id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  is_read: boolean;
  read_at?: string;
  source_type: string;
  source_id: string;
  expire_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  _id: string;
  project_id: string;
  title: string;
  description: string;
  type: 'meeting' | 'email' | 'call' | 'discussion' | 'report';
  participants: string[];
  date: string;
  location: string;
  outcome: string;
  attachments: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ConfigItem {
  _id: string;
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string;
  is_sensitive: boolean;
  created_at: string;
  updated_at: string;
}

export interface DrillPlan {
  _id: string;
  project_id: string;
  name: string;
  description: string;
  type: 'fire' | 'disaster' | 'security' | 'network' | 'database';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  actual_date?: string;
  participants: string[];
  result: string;
  lessons_learned: string;
  created_at: string;
  updated_at: string;
}

export interface DeploymentPlan {
  _id: string;
  project_id: string;
  name: string;
  description: string;
  version: string;
  status: 'planned' | 'approved' | 'deploying' | 'success' | 'failed' | 'rolled_back';
  scheduled_date: string;
  actual_date?: string;
  rollback_plan: string;
  approver_id: string;
  deployed_by: string;
  result: string;
  created_at: string;
  updated_at: string;
}

export interface WorkRecord {
  _id: string;
  user_id: string;
  project_id: string;
  date: string;
  hours: number;
  type: 'work' | 'overtime' | 'leave' | 'training';
  description: string;
  status: 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface DataDictionary {
  _id: string;
  category: string;
  code: string;
  name: string;
  value: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}
