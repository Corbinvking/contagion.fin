import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VirusInsights from './pages/VirusInsights';
import Stream from './pages/Stream';
import Documentation from './pages/Documentation';
import { MutationProvider } from './context/MutationContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <MutationProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Stream />}>
                <Route path="metrics" element={<Dashboard />} />
                <Route path="virus-insights" element={<VirusInsights />} />
              </Route>
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </MutationProvider>
    </AuthProvider>
  );
}

export default App;