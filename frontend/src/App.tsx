import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreateProjectPage from './pages/CreateProjectPage';
import VerifierPage from './pages/VerifierPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/create-project" element={<CreateProjectPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/verifier" element={<VerifierPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;