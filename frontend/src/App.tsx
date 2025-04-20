import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigProvider } from 'antd';

function App() {
  
  return (
  <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Lufga', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      
    <MainLayout>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute requireAuth={false}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </MainLayout>

  </ConfigProvider>
  );
}

export default App;