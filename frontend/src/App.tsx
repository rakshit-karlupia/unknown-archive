import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { SearchModal } from './components/SearchModal';
import { AboutPage } from './pages/AboutPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ExplorePage } from './pages/ExplorePage';
import { GlobalMapPage } from './pages/GlobalMapPage';
import { HomePage } from './pages/HomePage';
import { InvestigationPage } from './pages/InvestigationPage';
import { ResearchLibraryPage } from './pages/ResearchLibraryPage';

export function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#0B1020] text-[#F4F6FB]">
        <Navbar onOpenSearch={() => setSearchOpen(true)} />
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/map" element={<GlobalMapPage />} />
            <Route path="/library" element={<ResearchLibraryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/investigation/:slug" element={<InvestigationPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
