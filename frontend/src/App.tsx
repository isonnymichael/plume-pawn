import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
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
  );
}

export default App;