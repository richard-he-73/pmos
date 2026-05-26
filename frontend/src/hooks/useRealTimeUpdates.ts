import { useEffect } from 'react';
import { useWebSocketMessage, useWebSocket } from './useWebSocket.tsx';
import { apiSlice } from '../store/api';
import { useDispatch } from 'react-redux';

export function useRealTimeUpdates() {
  useWebSocketMessage('task.updated', () => {
    console.log('任务更新，重新获取数据...');
  });

  useWebSocketMessage('project.updated', () => {
    console.log('项目更新，重新获取数据...');
  });

  useWebSocketMessage('risk.created', () => {
    console.log('风险更新，重新获取数据...');
  });

  return null;
}

export function useAutoRefetchOnUpdate() {
  const { messages } = useWebSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (['task.updated', 'task.created', 'task.deleted'].includes(lastMessage.type)) {
        console.log('任务更新，无效化缓存');
        dispatch(apiSlice.util.invalidateTags(['Tasks']));
      }
      
      if (['project.updated', 'project.created', 'project.deleted'].includes(lastMessage.type)) {
        console.log('项目更新，无效化缓存');
        dispatch(apiSlice.util.invalidateTags(['Projects']));
      }
      
      if (['risk.updated', 'risk.created', 'risk.deleted'].includes(lastMessage.type)) {
        console.log('风险更新，无效化缓存');
        dispatch(apiSlice.util.invalidateTags(['Risks']));
      }
    }
  }, [messages, dispatch]);
}
