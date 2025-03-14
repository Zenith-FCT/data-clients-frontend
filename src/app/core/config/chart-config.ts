import { Chart, registerables, TooltipOptions, LegendOptions } from 'chart.js';

// Registramos todos los componentes y controladores necesarios de Chart.js
Chart.register(...registerables);

// Configuración global para todos los gráficos
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// Configuración de estilo global
Chart.defaults.color = '#666';
Chart.defaults.font.family = "'Arial', sans-serif";

// Configuración de las animaciones
Chart.defaults.animation = {
  duration: 1000,
  easing: 'easeInOutQuart'
};

// Configuración global de tooltips
Object.assign(Chart.defaults.plugins.tooltip, {
  enabled: true,
  backgroundColor: 'rgba(0,0,0,0.8)',
  padding: 12,
  titleFont: {
    size: 14
  },
  bodyFont: {
    size: 13
  },
  displayColors: true,
  mode: 'nearest',
  intersect: true,
  position: 'nearest'
} as TooltipOptions<'line'>); // Usando un tipo específico como fallback

// Configuración de leyendas
Object.assign(Chart.defaults.plugins.legend, {
  position: 'bottom',
  align: 'start',
  labels: {
    boxWidth: 12,
    boxHeight: 12,
    padding: 15,
    usePointStyle: true,
    color: '#666',
    font: {
      size: 11
    }
  }
} as LegendOptions<'line'>); // Usando un tipo específico como fallback