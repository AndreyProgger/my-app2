import React, { useState, useEffect } from 'react'
import './ConverterPage.css'

interface ExchangeRates {
  [key: string]: number
}

const ConverterPage: React.FC = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>('1')
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('RUB')
  const [result, setResult] = useState<number | null>(null)
  const [rateInfo, setRateInfo] = useState<{fromTo: string, toFrom: string}>({fromTo: '0', toFrom: '0'})

  // Демо-данные на случай, если API не работает
  const demoRates: ExchangeRates = {
    USD: 1,
    RUB: 75.5,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 147.5,
    CNY: 7.2
  }

  // Популярные валюты для отображения
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'RUB']

  const fetchExchangeRates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Используем более стабильное API с поддержкой CORS
      const API_URL = 'https://open.er-api.com/v6/latest/USD'
      
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.result === 'error') {
        throw new Error(data['error-type'] || 'Ошибка API')
      }
      
      if (!data.rates) {
        throw new Error('Некорректный ответ от сервера')
      }
      
      // Проверяем наличие курса для RUB
      if (!data.rates.RUB) {
        console.warn('RUB not found in API response, using demo data')
        setExchangeRates(demoRates)
        convertCurrency(demoRates)
        setError('API не вернул курс для RUB. Используются демо-данные.')
      } else {
        setExchangeRates(data.rates)
        convertCurrency(data.rates)
      }
      
    } catch (err) {
      console.error('Ошибка при загрузке курсов:', err)
      setError('Не удалось загрузить актуальные курсы валют. Используются демо-данные.')
      
      // Используем демо-данные с фиксированными курсами
      setExchangeRates(demoRates)
      convertCurrency(demoRates)
    } finally {
      setLoading(false)
    }
  }

  const convertCurrency = (rates: ExchangeRates) => {
    try {
      const numAmount = parseFloat(amount)
      
      if (isNaN(numAmount) || numAmount <= 0) {
        setResult(null)
        return
      }
      
      // Получаем курсы для конвертации
      const fromRate = rates[fromCurrency]
      const toRate = rates[toCurrency]
      
      if (!fromRate || !toRate) {
        throw new Error(`Курс для ${!fromRate ? fromCurrency : toCurrency} недоступен`)
      }
      
      // Простая конвертация через USD как базовую валюту
      // amount в fromCurrency -> USD -> toCurrency
      const amountInUSD = fromCurrency === 'USD' 
        ? numAmount 
        : numAmount / fromRate
      
      const convertedAmount = toCurrency === 'USD'
        ? amountInUSD
        : amountInUSD * toRate
      
      const roundedResult = Math.round(convertedAmount * 100) / 100
      setResult(roundedResult)
      
      // Рассчитываем информацию о курсах
      if (fromRate && toRate) {
        const fromToRate = (toRate / fromRate).toFixed(4)
        const toFromRate = (fromRate / toRate).toFixed(4)
        setRateInfo({
          fromTo: fromToRate,
          toFrom: toFromRate
        })
      }
      
    } catch (err) {
      console.error('Ошибка при конвертации:', err)
      setError(`Ошибка конвертации: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`)
      setResult(null)
    }
  }

  useEffect(() => {
    fetchExchangeRates()
    
    // Обновляем курсы каждые 10 минут
    const interval = setInterval(fetchExchangeRates, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      convertCurrency(exchangeRates)
    }
  }, [amount, fromCurrency, toCurrency])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Разрешаем только числа и точку для десятичных
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value)
    }
  }

  const handleFromCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFromCurrency(e.target.value)
  }

  const handleToCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToCurrency(e.target.value)
  }

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const formatCurrency = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ` ${currencyCode}`
  }

  return (
    <div className="converter-page">
      <h2>Конвертер валют</h2>
      
      {error && (
        <div className="warning-message">
          <p>⚠️ {error}</p>
          <p className="note">Это демонстрационная версия. Актуальные курсы будут загружены, как только соединение восстановится.</p>
        </div>
      )}
      
      <div className="converter-container">
        <div className="converter-card">
          <div className="converter-header">
            <h3>Конвертация</h3>
            <button 
              onClick={fetchExchangeRates} 
              className="refresh-button"
              disabled={loading}
            >
              {loading ? 'Обновление...' : '🔄 Обновить курсы'}
            </button>
          </div>
          
          <div className="converter-form">
            <div className="input-group">
              <label htmlFor="amount">Сумма:</label>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Введите сумму"
                className="amount-input"
              />
            </div>
            
            <div className="currency-selectors">
              <div className="currency-group">
                <label htmlFor="fromCurrency">Из валюты:</label>
                <select
                  id="fromCurrency"
                  value={fromCurrency}
                  onChange={handleFromCurrencyChange}
                  className="currency-select"
                >
                  {popularCurrencies.map(currency => (
                    <option key={`from-${currency}`} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleSwapCurrencies} 
                className="swap-button"
                title="Поменять валюты местами"
              >
                ⇄
              </button>
              
              <div className="currency-group">
                <label htmlFor="toCurrency">В валюту:</label>
                <select
                  id="toCurrency"
                  value={toCurrency}
                  onChange={handleToCurrencyChange}
                  className="currency-select"
                >
                  {popularCurrencies.map(currency => (
                    <option key={`to-${currency}`} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {result !== null && (
              <div className="result-section">
                <h4>Результат:</h4>
                <div className="result-value">
                  {formatCurrency(parseFloat(amount) || 0, fromCurrency)} = 
                  <span className="result-amount">
                    {formatCurrency(result, toCurrency)}
                  </span>
                </div>
                
                <div className="rate-info">
                  <p>
                    1 {fromCurrency} = {rateInfo.fromTo} {toCurrency}
                  </p>
                  <p>
                    1 {toCurrency} = {rateInfo.toFrom} {fromCurrency}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="rates-card">
          <h3>Текущие курсы</h3>
          {loading ? (
            <div className="loading-rates">
              <div className="spinner"></div>
              <p>Загрузка курсов...</p>
            </div>
          ) : (
            <div className="rates-table">
              <table>
                <thead>
                  <tr>
                    <th>Валюта</th>
                    <th>Курс к USD</th>
                    <th>Курс к RUB</th>
                  </tr>
                </thead>
                <tbody>
                  {popularCurrencies.map(currency => {
                    if (currency === 'USD') return null
                    
                    const rateToUSD = exchangeRates[currency] || demoRates[currency] || 0
                    const rateToRUB = exchangeRates.RUB 
                      ? rateToUSD / exchangeRates.RUB 
                      : demoRates.RUB 
                        ? rateToUSD / demoRates.RUB 
                        : 0
                    
                    return (
                      <tr key={currency}>
                        <td>{currency}</td>
                        <td>{rateToUSD.toFixed(4)}</td>
                        <td>{rateToRUB.toFixed(4)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="converter-info">
            <h4>Информация</h4>
            <p>Данные предоставлены Open Exchange Rates API</p>
            <p>Обновление курсов каждые 10 минут</p>
            <p className="note">
              Примечание: Все конвертации выполняются через USD как базовую валюту
            </p>
          </div>
        </div>
      </div>
      
      <div className="currency-info">
        <h4>Справка по валютам:</h4>
        <ul>
          <li><strong>USD</strong> - Доллар США (базовая валюта)</li>
          <li><strong>EUR</strong> - Евро (Европейский союз)</li>
          <li><strong>GBP</strong> - Фунт стерлингов (Великобритания)</li>
          <li><strong>JPY</strong> - Иена (Япония)</li>
          <li><strong>CNY</strong> - Юань (Китай)</li>
          <li><strong>RUB</strong> - Российский рубль</li>
        </ul>
      </div>
    </div>
  )
}

export default ConverterPage