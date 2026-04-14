import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import FrontPage from './pages/home'
import LoginSignup from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import TravelAIPage from './pages/AI_page'
import WeatherPage from './pages/weather'
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
  const hideNavbarPaths = ['/', '/chat', '/login', '/signup', '/forgot-password'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  const isLoggedIn = !!localStorage.getItem('userId');

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/chat" replace /> : <FrontPage />} />
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/chat" replace /> : <LoginSignup />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/chat" replace /> : <LoginSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/ai" element={<TravelAIPage />} />
        <Route path="/weather" element={<WeatherPage />} />
      </Routes>
    </>
  );
}

export default App
