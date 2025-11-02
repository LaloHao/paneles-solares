import { useState } from 'react'
import './App.css'
import SolarTips from './components/SolarTips'

interface CalculationResult {
  panelsNeededExact: number
  panelsNeededRounded: number
  systemPowerWatts: number
  monthlyGeneration: number
  roofCapacity: number
  efficiencyPercentage: number
}

function App() {
  const [totalConsumption, setTotalConsumption] = useState<number>(0) // kWh del recibo
  const [billingPeriod, setBillingPeriod] = useState<number>(2) // meses del recibo
  const [roofArea, setRoofArea] = useState<number>(0)
  const [sunHours, setSunHours] = useState<number>(5.5) // Promedio México
  const [panelPower, setPanelPower] = useState<number>(400)
  const [result, setResult] = useState<CalculationResult | null>(null)

  const calculateSolarSystem = () => {
    // Validación de entrada
    if (totalConsumption <= 0) {
      alert('Por favor ingresa un consumo válido del recibo');
      return;
    }

    // Calcular consumo mensual real
    const monthlyConsumption = totalConsumption / billingPeriod
    
    // Consumo diario en kWh
    const dailyConsumption = monthlyConsumption / 30
    
    // Factor de eficiencia del sistema (considerando pérdidas de inversor, cables, etc.)
    const systemEfficiency = 0.85
    
    // Energía diaria requerida del sistema solar (kWh) considerando eficiencia
    const dailyEnergyNeeded = dailyConsumption / systemEfficiency
    
    // Energía diaria por panel (kWh) - considerando condiciones reales
    const dailyEnergyPerPanel = (panelPower / 1000) * sunHours * 0.8 // Factor de rendimiento real
    
    // Número exacto de paneles necesarios (con decimales)
    const panelsNeededExact = dailyEnergyNeeded / dailyEnergyPerPanel
    
    // Número redondeado hacia arriba (mínimo 1 panel)
    const panelsNeededRounded = Math.max(1, Math.ceil(panelsNeededExact))
    
    // Verificar si hay suficiente espacio en el techo
    const maxPanelsInRoof = roofArea > 0 ? Math.floor(roofArea / 2.2) : panelsNeededRounded
    const finalPanels = roofArea > 0 ? Math.min(panelsNeededRounded, maxPanelsInRoof) : panelsNeededRounded
    
    // Potencia total del sistema en Watts
    const finalSystemPowerWatts = finalPanels * panelPower
    
    // Energía generada mensualmente (considerando eficiencia real)
    const monthlyGeneration = (finalSystemPowerWatts / 1000) * sunHours * 30 * 0.8
    
    // Porcentaje de eficiencia del sistema respecto al consumo
    const efficiencyPercentage = (monthlyGeneration / monthlyConsumption) * 100

    setResult({
      panelsNeededExact,
      panelsNeededRounded: finalPanels,
      systemPowerWatts: finalSystemPowerWatts,
      monthlyGeneration,
      roofCapacity: maxPanelsInRoof,
      efficiencyPercentage: Math.min(efficiencyPercentage, 100)
    })
  }

  return (
    <div className="calculator-container">
      <h1>🌞 Calculador de Paneles Solares</h1>
      
      <div className="input-section">
        <h2>Información de tu hogar</h2>
        
        <div className="input-group">
          <label htmlFor="totalConsumption">Consumo total del recibo CFE (kWh):</label>
          <input
            type="number"
            id="totalConsumption"
            value={totalConsumption}
            onChange={(e) => setTotalConsumption(Number(e.target.value))}
            placeholder="Ej: 700 (recibo bimestral)"
          />
          <small>💡 Este es el número total de kWh que aparece en tu recibo de CFE</small>
        </div>

        <div className="input-group">
          <label htmlFor="billingPeriod">Período del recibo (meses):</label>
          <select
            id="billingPeriod"
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(Number(e.target.value))}
          >
            <option value={1}>1 mes</option>
            <option value={2}>2 meses (bimestral)</option>
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
          </select>
          <small>💡 La mayoría de recibos CFE en México son bimestrales (2 meses)</small>
        </div>

        <div className="input-group">
          <label htmlFor="roofArea">Área disponible en el techo (m²):</label>
          <input
            type="number"
            id="roofArea"
            value={roofArea}
            onChange={(e) => setRoofArea(Number(e.target.value))}
            placeholder="Ej: 50"
          />
        </div>

        <div className="input-group">
          <label htmlFor="sunHours">Horas de sol promedio por día:</label>
          <input
            type="number"
            step="0.1"
            id="sunHours"
            value={sunHours}
            onChange={(e) => setSunHours(Number(e.target.value))}
            placeholder="Ej: 5.5"
          />
        </div>

        <h3>Configuración de paneles</h3>
        
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
              <h3>🏠 Capacidad del Techo</h3>
              <p className="result-value">{result.roofCapacity}</p>
              <p className="result-unit">paneles máximos</p>
            </div>

            <div className="result-card">
              <h3>✅ Cobertura</h3>
              <p className="result-value">{result.efficiencyPercentage.toFixed(1)}%</p>
              <p className="result-unit">del consumo</p>
            </div>

            <div className="result-card">
              <h3>🌱 Reducción CO₂</h3>
              <p className="result-value">{(result.monthlyGeneration * 12 * 0.5).toFixed(0)}</p>
              <p className="result-unit">kg/año</p>
            </div>

            <div className="result-card">
              <h3>🌱 Reducción CO₂</h3>
              <p className="result-value">{(result.monthlyGeneration * 12 * 0.5).toFixed(0)}</p>
              <p className="result-unit">kg/año</p>
            </div>
          </div>

          <div className="summary">
            <h3>📝 Resumen</h3>
            
            {(totalConsumption / billingPeriod) < 50 && (
              <div style={{backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ffeaa7'}}>
                <strong>⚠️ Consumo muy bajo:</strong> {(totalConsumption / billingPeriod).toFixed(0)} kWh/mes es un consumo extremadamente bajo. 
                Un hogar promedio consume entre 200-500 kWh/mes. Verifica tu recibo CFE.
              </div>
            )}
            
            {(totalConsumption / billingPeriod) > 1000 && (
              <div style={{backgroundColor: '#f8d7da', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #f5c6cb'}}>
                <strong>⚠️ Consumo muy alto:</strong> {(totalConsumption / billingPeriod).toFixed(0)} kWh/mes es un consumo muy elevado. 
                Considera mejorar la eficiencia energética antes de instalar paneles solares.
              </div>
            )}
            
            <div style={{backgroundColor: '#e8f5e8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #c3e6c3'}}>
              <strong>📊 Análisis del recibo:</strong>
              <br />• Consumo total: {totalConsumption} kWh en {billingPeriod} mes{billingPeriod > 1 ? 'es' : ''}
              <br />• Consumo mensual promedio: {(totalConsumption / billingPeriod).toFixed(0)} kWh/mes
              <br />• Consumo diario promedio: {(totalConsumption / billingPeriod / 30).toFixed(1)} kWh/día
            </div>
            
            <ul>
              <li>Cálculo exacto: {result.panelsNeededExact.toFixed(2)} paneles de {panelPower}W</li>
              <li>Recomendamos: {result.panelsNeededRounded} paneles solares completos</li>
              <li>Tu sistema generará {result.monthlyGeneration.toFixed(0)} kWh por mes</li>
              <li>Potencia total: {result.systemPowerWatts.toLocaleString()} Watts</li>
              <li>Cobertura del {result.efficiencyPercentage.toFixed(1)}% de tu consumo mensual</li>
              <li>Área requerida: {(result.panelsNeededRounded * 2.2).toFixed(1)} m²</li>
              <li>Evitarás {(result.monthlyGeneration * 12 * 0.5).toFixed(0)} kg de CO₂ al año</li>
              {roofArea > 0 && result.panelsNeededRounded > result.roofCapacity && (
                <li style={{color: '#e74c3c'}}>⚠️ Tu techo solo puede acomodar {result.roofCapacity} paneles</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {result && (
        <SolarTips 
          systemPower={result.systemPowerWatts / 1000} 
          monthlySavings={0} 
        />
      )}
    </div>
  )
}

export default App
