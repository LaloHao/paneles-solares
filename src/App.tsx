import { useEffect, useState } from 'react'
import './App.css'
import SolarTips from './components/SolarTips'

interface CalculationResult {
  panelsNeededExact: number
  panelsNeededRounded: number
  systemPowerWatts: number
  monthlyGeneration: number
  monthlySavings: number
}

function App() {
  // Función para cargar datos iniciales desde localStorage
  const loadInitialState = () => {
    try {
      const savedData = localStorage.getItem('solarCalculatorData')
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error('Error cargando datos del localStorage:', error)
    }
    return {
      billingPeriod: 2,
      billingData: Array(6).fill(0),
      peakSolarHours: 5,
      lossFactory: 1.2,
      panelPower: 400
    }
  }

  const initialState = loadInitialState()

  const [billingPeriod, setBillingPeriod] = useState<number>(initialState.billingPeriod)
  const [billingData, setBillingData] = useState<number[]>(initialState.billingData)
  const [peakSolarHours, setPeakSolarHours] = useState<number>(initialState.peakSolarHours)
  const [lossFactory, setLossFactory] = useState<number>(initialState.lossFactory)
  const [panelPower, setPanelPower] = useState<number>(initialState.panelPower)
  const [result, setResult] = useState<CalculationResult | null>(null)

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    const dataToSave = {
      billingPeriod,
      billingData,
      peakSolarHours,
      lossFactory,
      panelPower
    }
    localStorage.setItem('solarCalculatorData', JSON.stringify(dataToSave))
  }, [billingPeriod, billingData, peakSolarHours, lossFactory, panelPower])


  // Calcular número de períodos según el período seleccionado
  const getNumberOfPeriods = (period: number): number => {
    return Math.ceil(12 / period)
  }

  // Obtener etiqueta del período
  const getPeriodLabel = (period: number, index: number): string => {
    switch (period) {
      case 1:
        return `Mes ${index + 1}`
      case 2:
        return `Bimestre ${index + 1}`
      case 3:
        return `Trimestre ${index + 1}`
      case 6:
        return `Semestre ${index + 1}`
      default:
        return `Período ${index + 1}`
    }
  }

  // Actualizar datos de consumo
  const handleBillingDataChange = (index: number, value: number) => {
    const newData = [...billingData]
    newData[index] = value
    setBillingData(newData)
  }

  // Cambiar período y reset datos
  const handlePeriodChange = (newPeriod: number) => {
    setBillingPeriod(newPeriod)
    const periods = getNumberOfPeriods(newPeriod)
    setBillingData(Array(periods).fill(0))
  }

  // Calcular consumo anual total
  const getTotalAnnualConsumption = (): number => {
    return billingData.reduce((sum, val) => sum + val, 0)
  }

  // Calcular consumo diario
  const getDailyConsumption = (): number => {
    const total = getTotalAnnualConsumption()
    return total > 0 ? total / 365 : 0
  }

  const calculateSolarSystem = () => {
    // Validación de entrada
    const totalConsumption = getTotalAnnualConsumption()
    const dailyConsumption = getDailyConsumption()
    
    if (totalConsumption <= 0) {
      alert('Por favor ingresa el consumo de tus recibos');
      return;
    }

    // Consumo diario en kWh
    const dailyConsumptionKwh = dailyConsumption
    
    // Fórmula de potencia fotovoltaica: (P * l) / h
    // P = consumo diario, l = factor de pérdida, h = horas solar pico
    const requiredPowerKw = (dailyConsumptionKwh * lossFactory) / peakSolarHours
    const requiredPowerW = requiredPowerKw * 1000
    
    // Número exacto de paneles necesarios (con decimales)
    const panelsNeededExact = requiredPowerW / panelPower
    
    // Número redondeado hacia arriba (mínimo 1 panel)
    const panelsNeededRounded = Math.max(1, Math.ceil(panelsNeededExact))
    
    // Potencia total del sistema en Watts
    const finalSystemPowerWatts = panelsNeededRounded * panelPower
    
    // Energía generada diariamente
    const dailyGeneration = (finalSystemPowerWatts / 1000) * peakSolarHours
    
    // Energía generada mensualmente
    const monthlyGeneration = dailyGeneration * 30
    
    // Costo de electricidad en México (MXN por kWh) - promedio CFE
    const costPerKwh = 2.5
    
    // Ahorro mensual estimado
    const monthlySavings = monthlyGeneration * costPerKwh

    setResult({
      panelsNeededExact,
      panelsNeededRounded,
      systemPowerWatts: finalSystemPowerWatts,
      monthlyGeneration,
      monthlySavings
    })
  }

  return (
    <div className="calculator-container">
      <h1>🌞 Calculador de Paneles Solares</h1>
      
      <div className="input-section">
        <h2>Información de tu hogar</h2>
        
        <div className="input-group">
          <label htmlFor="billingPeriod">Período del recibo (meses):</label>
          <select
            id="billingPeriod"
            value={billingPeriod}
            onChange={(e) => handlePeriodChange(Number(e.target.value))}
          >
            <option value={1}>1 mes (12 recibos anuales)</option>
            <option value={2}>2 meses - Bimestral (6 recibos anuales)</option>
            <option value={3}>3 meses - Trimestral (4 recibos anuales)</option>
            <option value={6}>6 meses - Semestral (2 recibos anuales)</option>
          </select>
          <small>💡 Selecciona el período de tu recibo CFE</small>
        </div>

        <div className="billing-inputs-section">
          <h3>Consumo de {getNumberOfPeriods(billingPeriod) * billingPeriod} meses ({getNumberOfPeriods(billingPeriod)} {getPeriodLabel(billingPeriod, 0).toLowerCase().split(' ')[0]}s)</h3>
          <div className="billing-grid">
            {billingData.map((value, index) => (
              <div key={index} className="input-group billing-input">
                <label htmlFor={`billing-${index}`}>{getPeriodLabel(billingPeriod, index)} (kWh):</label>
                <input
                  type="number"
                  id={`billing-${index}`}
                  value={value}
                  onChange={(e) => handleBillingDataChange(index, Number(e.target.value))}
                  placeholder={`Período ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="consumption-summary">
            <p><strong>Consumo anual total:</strong> <span className="highlight">{getTotalAnnualConsumption().toFixed(0)} kWh</span></p>
            <p><strong>Consumo mensual promedio:</strong> <span className="highlight">{(getTotalAnnualConsumption() / 12).toFixed(0)} kWh/mes</span></p>
            <p><strong>Consumo diario promedio:</strong> <span className="highlight">{getDailyConsumption().toFixed(2)} kWh/día</span></p>
          </div>
        </div>

        <h3>Configuración de paneles</h3>

        <div className="input-group">
          <label htmlFor="peakSolarHours">Horas solar pico por día:</label>
          <input
            type="number"
            step="0.1"
            id="peakSolarHours"
            value={peakSolarHours}
            onChange={(e) => setPeakSolarHours(Number(e.target.value))}
            placeholder="Ej: 5"
          />
          <small>💡 Default para México: 5 horas</small>
        </div>

        <div className="input-group">
          <label htmlFor="lossFactory">Factor de pérdida (inversor, cables, etc.):</label>
          <input
            type="number"
            step="0.1"
            id="lossFactory"
            value={lossFactory}
            onChange={(e) => setLossFactory(Number(e.target.value))}
            placeholder="Ej: 1.2"
          />
          <small>💡 Default: 1.2 (20% de pérdidas)</small>
        </div>

        <div className="input-group">
          <label htmlFor="panelPower">Potencia por panel (W):</label>
          <input
            type="number"
            id="panelPower"
            value={panelPower}
            onChange={(e) => setPanelPower(Number(e.target.value))}
          />
        </div>

        <button onClick={calculateSolarSystem} className="calculate-btn">
          Calcular Paneles Necesarios
        </button>
      </div>

      {result && (
        <div className="results-section">
          <h2>📊 Resultados del Cálculo</h2>
          
          <div className="result-grid">
            <div className="result-card">
              <h3>🔌 Paneles Necesarios (Exacto)</h3>
              <p className="result-value">{result.panelsNeededExact.toFixed(2)}</p>
              <p className="result-unit">paneles de {panelPower}W</p>
            </div>

            <div className="result-card">
              <h3>🔌 Paneles Recomendados</h3>
              <p className="result-value">{result.panelsNeededRounded}</p>
              <p className="result-unit">paneles enteros</p>
            </div>

            <div className="result-card">
              <h3>⚡ Potencia del Sistema</h3>
              <p className="result-value">{result.systemPowerWatts.toLocaleString()}</p>
              <p className="result-unit">Watts</p>
            </div>

            <div className="result-card">
              <h3>� Generación Mensual</h3>
              <p className="result-value">{result.monthlyGeneration.toFixed(0)}</p>
              <p className="result-unit">kWh/mes</p>
            </div>

            <div className="result-card">
              <h3>🌱 Reducción CO₂</h3>
              <p className="result-value">{(result.monthlyGeneration * 12 * 0.5).toFixed(0)}</p>
              <p className="result-unit">kg/año</p>
            </div>
          </div>

          <div className="summary">
            <h3>📝 Resumen</h3>
            
            {(getTotalAnnualConsumption() / 12) < 50 && getTotalAnnualConsumption() > 0 && (
              <div style={{backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ffeaa7'}}>
                <strong>⚠️ Consumo muy bajo:</strong> {(getTotalAnnualConsumption() / 12).toFixed(0)} kWh/mes es un consumo extremadamente bajo. 
                Un hogar promedio consume entre 200-500 kWh/mes. Verifica tus recibos.
              </div>
            )}
            
            {(getTotalAnnualConsumption() / 12) > 1000 && (
              <div style={{backgroundColor: '#f8d7da', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #f5c6cb'}}>
                <strong>⚠️ Consumo muy alto:</strong> {(getTotalAnnualConsumption() / 12).toFixed(0)} kWh/mes es un consumo muy elevado. 
                Considera mejorar la eficiencia energética antes de instalar paneles solares.
              </div>
            )}
            
            <div style={{backgroundColor: '#e8f5e8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #c3e6c3'}}>
              <strong>📊 Análisis del consumo anual:</strong>
              <br />• Consumo total anual: {getTotalAnnualConsumption().toFixed(0)} kWh
              <br />• Consumo mensual promedio: {(getTotalAnnualConsumption() / 12).toFixed(0)} kWh/mes
              <br />• Consumo diario promedio: {getDailyConsumption().toFixed(2)} kWh/día
            </div>
            
            <ul>
              <li>Cálculo exacto: {result.panelsNeededExact.toFixed(2)} paneles de {panelPower}W</li>
              <li>Recomendamos: {result.panelsNeededRounded} paneles solares completos</li>
              <li>Tu sistema generará {result.monthlyGeneration.toFixed(0)} kWh por mes</li>
              <li>Potencia total: {result.systemPowerWatts.toLocaleString()} Watts</li>
              <li>Área requerida: {(result.panelsNeededRounded * 2.2).toFixed(2)} m²</li>
              <li>Evitarás {(result.monthlyGeneration * 12 * 0.5).toFixed(0)} kg de CO₂ al año</li>
            </ul>
          </div>
        </div>
      )}


      {/* TODO: Implementar recomendaciones personalizadas */}
      {/* result && (
        <SolarTips 
          systemPower={result.systemPowerWatts / 1000} 
          monthlySavings={result.monthlySavings} 
        />
      )}*/}
    </div>
  )
}

export default App;