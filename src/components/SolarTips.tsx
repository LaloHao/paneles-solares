interface SolarTipsProps {
  systemPower: number;
  monthlySavings: number;
}

export default function SolarTips({ systemPower, monthlySavings }: SolarTipsProps) {
  const tips = [
    {
      icon: "💡",
      title: "Orientación Óptima",
      description: "Los paneles deben orientarse hacia el sur (en el hemisferio norte) con una inclinación de 30-45°."
    },
    {
      icon: "🔧",
      title: "Mantenimiento",
      description: "Limpia los paneles cada 6 meses y revisa las conexiones anualmente para máximo rendimiento."
    },
    {
      icon: "📊",
      title: "Monitoreo",
      description: "Instala un sistema de monitoreo para seguir la producción de energía en tiempo real."
    },
    {
      icon: "🏠",
      title: "Eficiencia Energética",
      description: "Mejora primero la eficiencia de tu hogar con LED y electrodomésticos eficientes."
    },
    {
      icon: "💰",
      title: "Incentivos",
      description: "Consulta los incentivos fiscales y subsidios locales para energía solar."
    },
    {
      icon: "🔋",
      title: "Baterías",
      description: "Considera agregar baterías para almacenar energía y usar durante cortes de luz."
    }
  ];

  const getSystemRecommendation = () => {
    if (systemPower < 3) {
      return {
        level: "Sistema Pequeño",
        color: "#f39c12",
        advice: "Ideal para casas pequeñas o apartamentos. Considera paneles de alta eficiencia para maximizar el espacio."
      };
    } else if (systemPower < 6) {
      return {
        level: "Sistema Mediano",
        color: "#3498db",
        advice: "Perfecto para familias promedio. Considera la expansión futura si planeas vehículos eléctricos."
      };
    } else {
      return {
        level: "Sistema Grande",
        color: "#2ecc71",
        advice: "Excelente para familias grandes o alta demanda energética. Podrías vender exceso de energía a la red."
      };
    }
  };

  const recommendation = getSystemRecommendation();

  return (
    <div className="solar-tips">
      <h2>💡 Consejos y Recomendaciones</h2>
      
      <div className="recommendation-card" style={{ borderLeftColor: recommendation.color }}>
        <h3 style={{ color: recommendation.color }}>{recommendation.level}</h3>
        <p>{recommendation.advice}</p>
      </div>

      <div className="tips-grid">
        {tips.map((tip, index) => (
          <div key={index} className="tip-card">
            <div className="tip-icon">{tip.icon}</div>
            <h4>{tip.title}</h4>
            <p>{tip.description}</p>
          </div>
        ))}
      </div>

      <div className="financial-highlight">
        <h3>💸 Beneficios Financieros</h3>
        <div className="financial-stats">
          <div className="stat">
            <span className="stat-value">$MXN {(monthlySavings * 12).toFixed(0)}</span>
            <span className="stat-label">Ahorro anual</span>
          </div>
          <div className="stat">
            <span className="stat-value">$MXN {(monthlySavings * 12 * 25).toFixed(0)}</span>
            <span className="stat-label">Ahorro en 25 años</span>
          </div>
        </div>
      </div>
    </div>
  );
}
