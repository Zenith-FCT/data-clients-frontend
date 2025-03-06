import { Chart, ChartConfiguration, ChartEvent, ActiveElement } from 'chart.js';
import { BarChartData } from '../../domain/models/chart.model';
import { AbstractChartBuilder } from './abstract-chart.builder';

/**
 * Builder especializado en la creación de gráficos de barras
 */
export class BarChartBuilder extends AbstractChartBuilder {
  /**
   * Crea un gráfico de barras
   * @param data Datos para el gráfico
   * @param title Título del gráfico
   * @param onClick Función opcional para manejar eventos de clic
   * @returns Instancia de Chart o null si hay error
   */
  public createBarChart(
    data: BarChartData,
    title: string,
    onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  ): Chart | null {
    console.log('Creating bar chart with data:', data);
    
    // Verificar que los datos son válidos
    if (!data.labels.length || !data.values.length || data.labels.length !== data.values.length) {
      console.error('Invalid data for bar chart');
      return null;
    }
    
    if (!this.initializeCanvas()) {
      console.error('Failed to initialize canvas for bar chart');
      return null;
    }

    if (this._chart) {
      console.log('Destroying existing chart before creating a new one');
      this._chart.destroy();
      this._chart = null;
    }

    try {
      if (!this.ctx || !this.canvas) {
        throw new Error('Canvas context not available after initialization');
      }
      
      // Limpiar el canvas antes de dibujar
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: title,
            data: data.values,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Monto Total (€)',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              ticks: {
                callback: (tickValue: string | number) => {
                  return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(Number(tickValue));
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Mes',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            }
          }
        }
      };

      this._chart = new Chart(this.ctx, config);
      console.log('Bar chart created successfully');
      return this._chart;
    } catch (error) {
      console.error('Error creating bar chart:', error);
      return null;
    }
  }
}