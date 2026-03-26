import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import AddBalance from './pages/AddBalance';
import OrderHistory from './pages/OrderHistory';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/new-order" element={
            <ProtectedRoute>
              <Layout>
                <NewOrder />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/history" element={
            <ProtectedRoute>
              <Layout>
                <OrderHistory />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/add-balance" element={
            <ProtectedRoute>
              <Layout>
                <AddBalance />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
