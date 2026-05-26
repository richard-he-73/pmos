import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import { router } from './routes';
import { UserProvider } from './contexts/UserContext';
import { WebSocketProvider } from './hooks/useWebSocket.tsx';
import './styles/global.css';
import './styles/layout.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <UserProvider>
        <ConfigProvider locale={zhCN}>
          <WebSocketProvider>
            <RouterProvider router={router} />
          </WebSocketProvider>
        </ConfigProvider>
      </UserProvider>
    </Provider>
  </StrictMode>,
);
