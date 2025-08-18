import './App.css';
import Navbar from './components/Navbar';
import SearchButton from './components/SearchButton';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { DragProvider } from './contexts/DragContext';
import Home from './pages/Home';
import Film from './pages/Film';
import Dizi from './pages/Dizi';
import Anime from './pages/Anime';
import Ayarlar from './pages/Ayarlar';

function AppContent() {
  const location = useLocation();
  const showSearchButton = location.pathname !== '/ayarlar';

  return (
    <>
      <Navbar />
      {showSearchButton && <SearchButton />}
      <div className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/film" element={<Film />} />
          <Route path="/dizi" element={<Dizi />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/ayarlar" element={<Ayarlar />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <DragProvider>
        <Router>
          <AppContent />
        </Router>
      </DragProvider>
    </ToastProvider>
  );
}

export default App;
