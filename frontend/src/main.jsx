import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { RoomProvider, UserProvider } from './auth/Userprovider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RoomProvider>
        <App />
      </RoomProvider>
    </UserProvider>
  </StrictMode>,
);
