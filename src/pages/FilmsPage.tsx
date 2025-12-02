import React, { useState, useEffect } from 'react'
import './FilmsPage.css'

interface Film {
  id: number
  name: string
  alternativeName?: string
  year: number
  rating: {
    kp: number
  }
  description: string
  poster: {
    previewUrl: string
    url: string
  }
  genres: Array<{
    name: string
  }>
  countries: Array<{
    name: string
  }>
}

const FilmsPage: React.FC = () => {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = 'https://api.poiskkino.dev/v1.4/movie?page=1&limit=20&lists=top250&year=2010-2023&countries.name=Россия';
  const API_KEY = 'MXNJ88B-0RQ44HV-QXH6WP6-J3QNVHB'; 

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL, {
          headers: {
            'X-API-KEY': API_KEY
          }
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки данных')
        }

        const data = await response.json()
        setFilms(data.docs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка')
        
      } finally {
        setLoading(false)
      }
    }

    fetchFilms()
  }, [])


  // Функция для обработки ошибок загрузки изображений
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.src = 'https://via.placeholder.com/300x450?text=No+Image'
  }

  if (loading) {
    return (
      <div className="films-page">
        <h2>Топ российские фильмы</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка фильмов...</p>
        </div>
      </div>
    )
  }

  if (error && films.length === 0) {
    return (
      <div className="films-page">
        <h2>Топ российские фильмы</h2>
        <div className="error-container">
          <p className="error-message">Ошибка: {error}</p>
          <p>Используются демонстрационные данные</p>
        </div>
        <div className="films-grid">
          {films.map(film => (
            <div key={film.id} className="film-card">
              <img 
                src={film.poster?.previewUrl || film.poster?.url || 'https://via.placeholder.com/300x450?text=No+Image'} 
                alt={film.name}
                className="film-poster"
                onError={handleImageError}
              />
              <div className="film-content">
                <h3 className="film-title">{film.name || film.alternativeName}</h3>
                <div className="film-meta">
                  <span className="film-year">{film.year}</span>
                  <span className="film-rating">
                    ★ {film.rating?.kp ? film.rating.kp.toFixed(1) : 'Н/Д'}
                  </span>
                </div>
                <div className="film-genres">
                  {film.genres?.slice(0, 3).map((genre, index) => (
                    <span key={index} className="genre-tag">{genre.name}</span>
                  ))}
                </div>
                <p className="film-description">
                  {film.description 
                    ? (film.description.length > 150 
                        ? film.description.substring(0, 150) + '...' 
                        : film.description)
                    : 'Описание отсутствует'}
                </p>
                <div className="film-country">
                  Страна: {film.countries?.[0]?.name || 'Россия'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="films-page">
      <h2>Топ российские фильмы</h2>
      {error && (
        <div className="warning-message">
          <p>Примечание: {error}. Отображаются данные с API.</p>
        </div>
      )}
      <div className="films-grid">
        {films.map(film => (
          <div key={film.id} className="film-card">
            <img 
              src={film.poster?.previewUrl || film.poster?.url || 'https://via.placeholder.com/300x450?text=No+Image'} 
              alt={film.name}
              className="film-poster"
              onError={handleImageError}
            />
            <div className="film-content">
              <h3 className="film-title">{film.name || film.alternativeName}</h3>
              <div className="film-meta">
                <span className="film-year">{film.year}</span>
                <span className="film-rating">
                  ★ {film.rating?.kp ? film.rating.kp.toFixed(1) : 'Н/Д'}
                </span>
              </div>
              <div className="film-genres">
                {film.genres?.slice(0, 3).map((genre, index) => (
                  <span key={index} className="genre-tag">{genre.name}</span>
                ))}
              </div>
              <p className="film-description">
                {film.description 
                  ? (film.description.length > 150 
                      ? film.description.substring(0, 150) + '...' 
                      : film.description)
                  : 'Описание отсутствует'}
              </p>
              <div className="film-country">
                Страна: {film.countries?.[0]?.name || 'Россия'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilmsPage