/**
 * 全局统一的人员标签格式化工具
 * 所有下拉选择（单选/多选）中的人员显示格式统一为：姓名（岗位）
 */

export const roleLabel: Record<string, string> = {
  project_director: '项目总监',
  project_manager: '项目经理',
  consulting_expert: '咨询专家',
  consulting_advisor: '咨询顾问',
  consulting_assistant: '咨询助理',
  other: '其他',
}

export function memberLabel(m: any): string {
  if (!m) return ''
  const name = m.real_name || m.name || ''
  const role = m.project_role ? roleLabel[m.project_role] : ''
  return role ? `${name}（${role}）` : name
}
