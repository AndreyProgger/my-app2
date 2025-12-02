import React, { useState, useEffect } from 'react'
import './WeatherPage.css'

interface CurrentWeather {
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  weatherCode: number
}

interface DailyForecast {
  time: string
  weatherCode: number
  temperatureMax: number
  temperatureMin: number
}

interface WeatherData {
  current: CurrentWeather
  daily: DailyForecast[]
}

interface WeatherResponse {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    pressure_msl: number
    wind_speed_10m: number
    wind_direction_10m: number
    weather_code: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

const WeatherPage: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Координаты Нижнего Новгорода
  const latitude = 56.3269
  const longitude = 44.0065

  // Функция для получения кода погоды по WMO
  const getWeatherDescription = (code: number): { description: string; icon: string } => {
    switch (code) {
      case 0: return { description: 'Ясно', icon: '☀️' }
      case 1: return { description: 'Преимущественно ясно', icon: '🌤️' }
      case 2: return { description: 'Переменная облачность', icon: '⛅' }
      case 3: return { description: 'Пасмурно', icon: '☁️' }
      case 45:
      case 48: return { description: 'Туман', icon: '🌫️' }
      case 51:
      case 53:
      case 55: return { description: 'Морось', icon: '🌧️' }
      case 56:
      case 57: return { description: 'Ледяная морось', icon: '🌨️' }
      case 61:
      case 63:
      case 65: return { description: 'Дождь', icon: '🌧️' }
      case 66:
      case 67: return { description: 'Ледяной дождь', icon: '🌨️' }
      case 71:
      case 73:
      case 75: return { description: 'Снег', icon: '❄️' }
      case 77: return { description: 'Снежные зерна', icon: '🌨️' }
      case 80:
      case 81:
      case 82: return { description: 'Ливень', icon: '⛈️' }
      case 85:
      case 86: return { description: 'Снегопад', icon: '🌨️' }
      case 95: return { description: 'Гроза', icon: '⛈️' }
      case 96:
      case 99: return { description: 'Гроза с градом', icon: '⛈️🌨️' }
      default: return { description: 'Неизвестно', icon: '❓' }
    }
  }

  // Функция для получения направления ветра
  const getWindDirection = (degrees: number): string => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  // Функция для получения цвета температуры
  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return '#ff0000'
    if (temp >= 25) return '#ff6b6b'
    if (temp >= 20) return '#ffa726'
    if (temp >= 15) return '#ffd166'
    if (temp >= 10) return '#06d6a0'
    if (temp >= 5) return '#118ab2'
    if (temp >= 0) return '#073b4c'
    if (temp >= -10) return '#4cc9f0'
    if (temp >= -20) return '#4895ef'
    return '#4361ee'
  }

  // Функция для получения данных о погоде
  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe/Moscow&forecast_days=7`

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: WeatherResponse = await response.json()

      // Преобразуем данные в наш формат
      const weatherData: WeatherData = {
        current: {
          time: data.current.time,
          temperature: Math.round(data.current.temperature_2m),
          apparentTemperature: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          pressure: Math.round(data.current.pressure_msl * 0.750062), // Конвертируем в мм рт. ст.
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDirection: data.current.wind_direction_10m,
          weatherCode: data.current.weather_code
        },
        daily: data.daily.time.map((time, index) => ({
          time,
          weatherCode: data.daily.weather_code[index],
          temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
          temperatureMin: Math.round(data.daily.temperature_2m_min[index])
        }))
      }

      setWeather(weatherData)
      setLastUpdated(new Date().toLocaleString('ru-RU'))
      
    } catch (err) {
      console.error('Ошибка при загрузке погоды:', err)
      setError('Не удалось загрузить актуальные данные о погоде. Проверьте подключение к интернету.')
      
      // Используем демо-данные только в случае ошибки
      const demoWeather: WeatherData = {
        current: {
          time: new Date().toISOString(),
          temperature: -5,
          apparentTemperature: -8,
          humidity: 85,
          pressure: 765,
          windSpeed: 4,
          windDirection: 180,
          weatherCode: 3
        },
        daily: [
          { time: '2024-01-15', weatherCode: 3, temperatureMax: -3, temperatureMin: -7 },
          { time: '2024-01-16', weatherCode: 2, temperatureMax: -2, temperatureMin: -6 },
          { time: '2024-01-17', weatherCode: 1, temperatureMax: -1, temperatureMin: -5 },
          { time: '2024-01-18', weatherCode: 0, temperatureMax: 0, temperatureMin: -4 },
          { time: '2024-01-19', weatherCode: 0, temperatureMax: 1, temperatureMin: -3 }
        ]
      }
      setWeather(demoWeather)
      setLastUpdated('Демо-данные: ' + new Date().toLocaleString('ru-RU'))
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    
    // Обновляем погоду каждые 10 минут
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Функция для форматирования даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра'
    } else {
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
    }
  }

  // Функция для форматирования времени
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading && !weather) {
    return (
      <div className="weather-page">
        <h2>Погода в Нижнем Новгороде</h2>
        <div className="loading-container">
          <div className="weather-loading-spinner"></div>
          <p>Загрузка данных о погоде...</p>
        </div>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="weather-page">
        <h2>Погода в Нижнем Новгороде</h2>
        <div className="error-message">
          <p>Не удалось загрузить данные о погоде</p>
          <button onClick={fetchWeather} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const currentWeather = weather.current
  const weatherInfo = getWeatherDescription(currentWeather.weatherCode)
  const windDirection = getWindDirection(currentWeather.windDirection)

  return (
    <div className="weather-page">
      <h2>Погода в Нижнем Новгороде</h2>
      
      {error && (
        <div className="warning-message">
          <p>⚠️ {error}</p>
        </div>
      )}
      
      <div className="weather-header">
        <div className="location-info">
          <span className="location-icon">📍</span>
          <span className="location-text">Нижний Новгород</span>
        </div>
        <div className="last-updated">
          {lastUpdated && (
            <p>Обновлено: {lastUpdated}</p>
          )}
          <button 
            onClick={fetchWeather} 
            className="refresh-button"
            disabled={loading}
          >
            {loading ? 'Обновление...' : '🔄 Обновить'}
          </button>
        </div>
      </div>

      <div className="weather-container">
        <div className="weather-current">
          <div className="temperature-section">
            <div className="current-temp">
              <span 
                className="temp-value"
                style={{ color: getTemperatureColor(currentWeather.temperature) }}
              >
                {currentWeather.temperature}°
              </span>
              <span className="temp-icon">{weatherInfo.icon}</span>
            </div>
            <div className="weather-details-small">
              <p className="weather-description">{weatherInfo.description}</p>
              <p className="feels-like">
                Ощущается как: <span style={{ color: getTemperatureColor(currentWeather.apparentTemperature) }}>
                  {currentWeather.apparentTemperature}°
                </span>
              </p>
              <p className="current-time">
                Время обновления: {formatTime(currentWeather.time)}
              </p>
            </div>
          </div>
          
          <div className="weather-details-grid">
            <div className="detail-card">
              <div className="detail-icon">💧</div>
              <div className="detail-content">
                <span className="detail-label">Влажность</span>
                <span className="detail-value">{currentWeather.humidity}%</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">📊</div>
              <div className="detail-content">
                <span className="detail-label">Давление</span>
                <span className="detail-value">{currentWeather.pressure} мм рт. ст.</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">💨</div>
              <div className="detail-content">
                <span className="detail-label">Ветер</span>
                <span className="detail-value">
                  {currentWeather.windSpeed} м/с, {windDirection}
                </span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">🧭</div>
              <div className="detail-content">
                <span className="detail-label">Направление ветра</span>
                <span className="detail-value">{currentWeather.windDirection}° ({windDirection})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="weather-forecast">
          <h3>Прогноз на неделю</h3>
          <div className="forecast-container">
            {weather.daily.map((day, index) => {
              const dayWeather = getWeatherDescription(day.weatherCode)
              return (
                <div key={index} className="forecast-day">
                  <div className="forecast-header">
                    <span className="forecast-day-name">{formatDate(day.time)}</span>
                    <span className="forecast-day-icon">{dayWeather.icon}</span>
                  </div>
                  <div className="forecast-temperatures">
                    <span 
                      className="forecast-temp-max"
                      style={{ color: getTemperatureColor(day.temperatureMax) }}
                    >
                      {day.temperatureMax}°
                    </span>
                    <span className="temp-separator">/</span>
                    <span 
                      className="forecast-temp-min"
                      style={{ color: getTemperatureColor(day.temperatureMin) }}
                    >
                      {day.temperatureMin}°
                    </span>
                  </div>
                  <div className="forecast-description">{dayWeather.description}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="weather-info">
          <h4>Информация о данных</h4>
          <p>Данные предоставлены API Open-Meteo.com</p>
          <p>Координаты: {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E</p>
          <p>Часовой пояс: Europe/Moscow</p>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getTemperatureColor(30) }}></span>
              <span>Очень жарко (&gt;30°C)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getTemperatureColor(20) }}></span>
              <span>Тепло (20-30°C)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getTemperatureColor(10) }}></span>
              <span>Прохладно (10-20°C)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getTemperatureColor(0) }}></span>
              <span>Холодно (0-10°C)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getTemperatureColor(-10) }}></span>
              <span>Мороз (&lt;0°C)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherPage