import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MediaDetail from './pages/Media';
import Top100Page from './pages/Top100';
import AddMediaForm from './pages/addmedia';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import WatchlistPage from './pages/Watchlist';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/media/:id" element={<MediaDetail />} />
            <Route path="/top100" element={<Top100Page />} />
            <Route path="/addmedia" element={<AddMediaForm />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users/:id" element={<Profile />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;