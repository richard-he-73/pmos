import { Button } from 'antd';
import { EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';


interface OrgNode {
  id: string;
  name: string;
  org_level: string;
  parent_id: string | null | undefined;
}

interface OrgCardProps {
  node: OrgNode;
  levelName?: string;
  onEdit: (node: OrgNode) => void;
  onDelete: (nodeId: string) => void;
  children?: OrgCardProps[];
}

const OrgLevelColors: Record<string, string> = {
  'level1': 'oklch(58% 0.16 145)',
  'level2': 'oklch(55% 0.14 250)',
  'level3': 'oklch(70% 0.12 80)',
};

const OrgCard: React.FC<OrgCardProps> = ({ node, levelName, onEdit, onDelete, children }) => {
  const color = OrgLevelColors[node.org_level] || 'oklch(50% 0.10 200)';
  
  return (
    <div className="org-card-container">
      <div 
        className="org-card" 
        style={{ 
          '--card-color': color,
          '--card-bg': `${color}15`
        } as React.CSSProperties}
      >
        <div className="org-card-header">
          <div className="org-card-icon" style={{ background: `${color}15`, color }}>
            <TeamOutlined />
          </div>
          <div className="org-card-info">
            <div className="org-card-name">{node.name}</div>
            <div className="org-card-level">{levelName || node.org_level}</div>
          </div>
        </div>
        <div className="org-card-actions">
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(node)}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(node.id)}>删除</Button>
        </div>
      </div>
      {children && children.length > 0 && (
        <div className="org-card-children">
          {children.map((child) => (
            <OrgCard 
              key={child.node.id} 
              node={child.node} 
              levelName={child.levelName}
              onEdit={child.onEdit}
              onDelete={child.onDelete}
              children={child.children}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrgStructureCard: React.FC<{
  nodes: OrgNode[];
  levelNames: Record<string, string>;
  onEdit: (node: OrgNode) => void;
  onDelete: (nodeId: string) => void;
}> = ({ nodes, levelNames, onEdit, onDelete }) => {
  const buildTree = (parentId: string | null | undefined): OrgCardProps[] => {
    return nodes
      .filter(node => {
        const nodeParentId = node.parent_id;
        return parentId === null || parentId === undefined
          ? (nodeParentId === null || nodeParentId === undefined || nodeParentId === '')
          : nodeParentId === parentId;
      })
      .map(node => ({
        node,
        levelName: levelNames[node.org_level],
        onEdit,
        onDelete,
        children: buildTree(node.id),
      }));
  };

  const treeData = buildTree(null);

  return (
    <div className="org-structure-container">
      {treeData.map((item) => (
        <OrgCard 
          key={item.node.id} 
          node={item.node} 
          levelName={item.levelName}
          onEdit={item.onEdit}
          onDelete={item.onDelete}
          children={item.children}
        />
      ))}
    </div>
  );
};
