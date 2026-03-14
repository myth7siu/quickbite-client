import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import KitchenPage from './pages/KitchenPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="*" element={<Navigate to="/menu?table=1" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
