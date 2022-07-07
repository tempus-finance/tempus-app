import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Disclaimer, Privacy, Terms } from './components/LegalPages';
import HomePage from './components/HomePage';
import TeamPage from './components/TeamPage';
import TokenomicsPage from './components/TokenomicsPage';
import GovernancePage from './components/GovernancePage';

import './index.scss';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/tokenomics" element={<TokenomicsPage />} />
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
