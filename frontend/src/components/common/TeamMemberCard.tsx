import { Popconfirm, Button } from 'antd';
import { XOutlined, UserOutlined } from '@ant-design/icons';

interface TeamMemberCardProps {
  memberId: string;
  name: string;
  role?: string;
  orgNode?: string;
  type?: string;
  onRemove: (memberId: string) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  memberId,
  name,
  role,
  orgNode,
  type,
  onRemove,
}) => {
  return (
    <div className="member-card">
      <div className="member-header">
        <div className="member-icon">
          <UserOutlined />
        </div>
        <div className="member-name">{name}</div>
      </div>
      <div className="member-info">
        {role && (
          <span className="member-role">{role}</span>
        )}
        {orgNode && (
          <span className="member-org">{orgNode}</span>
        )}
        {!role && !orgNode && (
          <span className="member-type">{type === 'human' ? '人力资源' : '资源'}</span>
        )}
      </div>
      <div className="member-footer">
        <Popconfirm
          title="确定移除该成员？"
          onConfirm={() => onRemove(memberId)}
          okText="确定"
          cancelText="取消"
        >
          <Button size="small" danger icon={<XOutlined />}>移除</Button>
        </Popconfirm>
      </div>
    </div>
  );
};
