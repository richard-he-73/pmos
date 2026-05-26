import React from 'react';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useWebSocket, useWebSocketMessage } from '../hooks/useWebSocket.tsx';

export function RealTimeNotifications() {
  const { isConnected, messages } = useWebSocket();

  const unreadCount = messages.length;

  useWebSocketMessage('task.updated', (data: any) => {
    console.log('任务更新通知:', data);
  });

  useWebSocketMessage('project.updated', (data: any) => {
    console.log('项目更新通知:', data);
  });

  useWebSocketMessage('risk.created', (data: any) => {
    console.log('新风险通知:', data);
  });

  return (
    <Badge count={unreadCount} overflowCount={99} offset={[10, -10]}>
      <BellOutlined
        style={{ fontSize: 20, color: isConnected ? '#1890ff' : '#999' }}
      />
    </Badge>
  );
}
