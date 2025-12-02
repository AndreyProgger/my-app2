import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import FilmsPage from './pages/FilmsPage'
import ConverterPage from './pages/ConverterPage'
import WeatherPage from './pages/WeatherPage'
import './App.css'

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [bgClass, setBgClass] = useState('bg-home')
  
  useEffect(() => {
    switch (location.pathname) {
      case '/films':
        setBgClass('bg-films')
        break
      case '/converter':
        setBgClass('bg-converter')
        break
      case '/weather':
        setBgClass('bg-weather')
        break
      default:
        setBgClass('bg-home')
    }
  }, [location])

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <>
      {/* Фон отдельным элементом */}
      <div className={`background-layer ${bgClass}`}></div>
      
      <div className="app">
        <nav>
          <ul className="nav-list">
            <li>
              <button 
                className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => handleNavigation('/')}
              >
                ГЛАВНАЯ
              </button>
            </li>
            <li>
              <button 
                className={`nav-button ${location.pathname === '/films' ? 'active' : ''}`}
                onClick={() => handleNavigation('/films')}
              >
                Топ российские фильмы
              </button>
            </li>
            <li>
              <button 
                className={`nav-button ${location.pathname === '/converter' ? 'active' : ''}`}
                onClick={() => handleNavigation('/converter')}
              >
                Конвертер валют
              </button>
            </li>
            <li>
              <button 
                className={`nav-button ${location.pathname === '/weather' ? 'active' : ''}`}
                onClick={() => handleNavigation('/weather')}
              >
                Погода в Нижнем Новгороде
              </button>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/films" element={<FilmsPage />} />
            <Route path="/converter" element={<ConverterPage />} />
            <Route path="/weather" element={<WeatherPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Данная страница сделана в рамках курса по web разработке</p>
        </footer>
      </div>
    </>
  )
}

function App() {
  return (
    <Router basename="/my-vite-app">
      <AppContent />
    </Router>
  )
}

const HomePage: React.FC = () => (
  <div className="home-page">
    <h1>Главное меню</h1>
    <h2>Добро пожаловать!</h2>
    <p>Выберите раздел из меню навигации</p>
  </div>
)

export default App