import { useState } from 'react'
import './App.css'
import SolarTips from './components/SolarTips'

interface CalculationResult {
  panelsNeeded: number
  systemPower: number
  estimatedCost: number
  monthlySavings: number
  paybackYears: number
  co2ReductionPerYear: number
}

function App() {
  const [monthlyBill, setMonthlyBill] = useState<number>(0)
  const [roofArea, setRoofArea] = useState<number>(0)
  const [electricityRate, setElectricityRate] = useState<number>(0.12)
  const [sunHours, setSunHours] = useState<number>(5)
  const [panelPower, setPanelPower] = useState<number>(400)
  const [panelCost, setPanelCost] = useState<number>(250)
  const [installationCost, setInstallationCost] = useState<number>(2000)
  const [result, setResult] = useState<CalculationResult | null>(null)

  const calculateSolarSystem = () => {
    // Consumo mensual en kWh
    const monthlyConsumption = monthlyBill / electricityRate
    
    // Consumo diario en kWh
    const dailyConsumption = monthlyConsumption / 30
    
    // Energía diaria requerida del sistema solar (kWh)
    const dailyEnergyNeeded = dailyConsumption
    
    // Energía diaria por panel (kWh)
    const dailyEnergyPerPanel = (panelPower / 1000) * sunHours
    
    // Número de paneles necesarios
    const panelsNeeded = Math.ceil(dailyEnergyNeeded / dailyEnergyPerPanel)
    
    // Área requerida (asumiendo 2 m² por panel de 400W)
    const areaRequired = panelsNeeded * 2
    
    // Verificar si hay suficiente espacio en el techo
    const finalPanels = areaRequired <= roofArea ? panelsNeeded : Math.floor(roofArea / 2)
    const finalSystemPower = (finalPanels * panelPower) / 1000
    
    // Costo total del sistema
    const equipmentCost = finalPanels * panelCost
    const totalCost = equipmentCost + installationCost
    
    // Energía generada mensualmente
    const monthlyGeneration = finalSystemPower * sunHours * 30
    
    // Ahorro mensual
    const monthlySavings = monthlyGeneration * electricityRate
    
    // Tiempo de recuperación
    const paybackYears = totalCost / (monthlySavings * 12)
    
    // Reducción de CO2 (aprox. 0.5 kg CO2 por kWh)
    const co2ReductionPerYear = monthlyGeneration * 12 * 0.5
    
    setResult({
      panelsNeeded: finalPanels,
      systemPower: finalSystemPower,
      estimatedCost: totalCost,
      monthlySavings,
      paybackYears,
      co2ReductionPerYear
    })
  }

  return (
    <div className="calculator-container">
      <h1>🌞 Calculador de Paneles Solares</h1>
      
      <div className="input-section">
        <h2>Información de tu hogar</h2>
        
        <div className="input-group">
          <label htmlFor="monthlyBill">Factura eléctrica mensual ($):</label>
          <input
            type="number"
            id="monthlyBill"
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            placeholder="Ej: 150"
          />
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
          <label htmlFor="electricityRate">Tarifa eléctrica ($/kWh):</label>
          <input
            type="number"
            step="0.01"
            id="electricityRate"
            value={electricityRate}
            onChange={(e) => setElectricityRate(Number(e.target.value))}
            placeholder="Ej: 0.12"
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

        <h3>Configuración avanzada</h3>
        
        <div className="input-group">
          <label htmlFor="panelPower">Potencia por panel (W):</label>
          <input
            type="number"
            id="panelPower"
            value={panelPower}
            onChange={(e) => setPanelPower(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label htmlFor="panelCost">Costo por panel ($):</label>
          <input
            type="number"
            id="panelCost"
            value={panelCost}
            onChange={(e) => setPanelCost(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label htmlFor="installationCost">Costo de instalación ($):</label>
          <input
            type="number"
            id="installationCost"
            value={installationCost}
            onChange={(e) => setInstallationCost(Number(e.target.value))}
          />
        </div>

        <button onClick={calculateSolarSystem} className="calculate-btn">
          Calcular Sistema Solar
        </button>
      </div>

      {result && (
        <div className="results-section">
          <h2>📊 Resultados del Cálculo</h2>
          
          <div className="result-grid">
            <div className="result-card">
              <h3>🔌 Paneles Necesarios</h3>
              <p className="result-value">{result.panelsNeeded}</p>
              <p className="result-unit">paneles de {panelPower}W</p>
            </div>

            <div className="result-card">
              <h3>⚡ Potencia del Sistema</h3>
              <p className="result-value">{result.systemPower.toFixed(2)}</p>
              <p className="result-unit">kW</p>
            </div>

            <div className="result-card">
              <h3>💰 Costo Estimado</h3>
              <p className="result-value">${result.estimatedCost.toLocaleString()}</p>
              <p className="result-unit">inversión inicial</p>
            </div>

            <div className="result-card">
              <h3>💵 Ahorro Mensual</h3>
              <p className="result-value">${result.monthlySavings.toFixed(2)}</p>
              <p className="result-unit">por mes</p>
            </div>

            <div className="result-card">
              <h3>📈 Recuperación</h3>
              <p className="result-value">{result.paybackYears.toFixed(1)}</p>
              <p className="result-unit">años</p>
            </div>

            <div className="result-card">
              <h3>🌱 Reducción CO₂</h3>
              <p className="result-value">{result.co2ReductionPerYear.toFixed(0)}</p>
              <p className="result-unit">kg/año</p>
            </div>
          </div>

          <div className="summary">
            <h3>📝 Resumen</h3>
            <ul>
              <li>Con {result.panelsNeeded} paneles solares de {panelPower}W cada uno</li>
              <li>Generarás aproximadamente {(result.systemPower * sunHours * 30).toFixed(0)} kWh por mes</li>
              <li>Ahorrarás ${(result.monthlySavings * 12).toFixed(0)} al año en electricidad</li>
              <li>Recuperarás tu inversión en {result.paybackYears.toFixed(1)} años</li>
              <li>Evitarás {result.co2ReductionPerYear.toFixed(0)} kg de CO₂ al año</li>
            </ul>
          </div>
        </div>
      )}

      {result && (
        <SolarTips 
          systemPower={result.systemPower} 
          monthlySavings={result.monthlySavings} 
        />
      )}
    </div>
  )
}

export default App
