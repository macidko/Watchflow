import './App.css';
import Navbar from './components/Navbar';
import SearchButton from './components/SearchButton';
import ThemeLoader from './components/ThemeLoader';
import LayoutController from './components/LayoutController';
import ErrorBoundary from './components/ErrorBoundary';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { DragProvider } from './contexts/DragContext';
import Home from './pages/Home';
import Film from './pages/Film';
import Dizi from './pages/Dizi';
import Anime from './pages/Anime';
import Takvim from './pages/Takvim';
import Ayarlar from './pages/Ayarlar';
import ExportImportTest from './components/ExportImportTest';

function AppContent() {
  const location = useLocation();
  const showSearchButton = location.pathname !== '/ayarlar' && location.pathname !== '/takvim' && location.pathname !== '/test';

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
          <Route path="/takvim" element={<Takvim />} />
          <Route path="/ayarlar" element={<Ayarlar />} />
          <Route path="/test" element={<ExportImportTest />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <DragProvider>
          <Router>
            <ThemeLoader />
            <LayoutController>
              <AppContent />
            </LayoutController>
          </Router>
        </DragProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
