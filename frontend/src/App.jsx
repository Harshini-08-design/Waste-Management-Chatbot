import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Chat from './pages/Chat';
import MapPage from './pages/MapPage';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/global.css';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"      element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat"  element={<Chat />} />
          <Route path="/map"   element={<MapPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
