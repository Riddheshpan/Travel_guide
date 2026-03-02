import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import FrontPage from './pages/home'
import LoginSignup from './pages/Login'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import TravelAIPage from './pages/AI_page'
import Navbar from './components/Navbar'
import './pages/Pages_css/App.css'

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

const Layout = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/chat', '/login', '/signup'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/signup" element={<LoginSignup />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/ai" element={<TravelAIPage />} />
      </Routes>
    </>
  );
}

export default App
