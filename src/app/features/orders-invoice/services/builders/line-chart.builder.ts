import { Chart, ChartConfiguration, ChartEvent, ActiveElement } from 'chart.js';
import { LineChartData } from '../../domain/models/chart.model';
import { AbstractChartBuilder } from './abstract-chart.builder';

/**
 * Builder especializado en la creación de gráficos de línea
 */
export class LineChartBuilder extends AbstractChartBuilder {
  /**
   * Crea un gráfico de línea
   * @param data Datos para el gráfico
   * @param title Título del gráfico
   * @param onClick Función opcional para manejar eventos de clic
   * @returns Instancia de Chart o null si hay error
   */
  public createLineChart(
    data: LineChartData,
    title: string,
    onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  ): Chart | null {
    console.log('Creating line chart with data:', data);
    
    // Verificar que los datos son válidos
    if (!data.labels.length || !data.values.length || data.labels.length !== data.values.length) {
      console.error('Invalid data for line chart');
      return null;
    }
    
    if (!this.initializeCanvas()) {
      console.error('Failed to initialize canvas for line chart');
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
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: data.label,
            data: data.values,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointHoverBackgroundColor: 'rgb(54, 162, 235)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick,
          layout: {
            padding: {
              left: 10, 
              right: 10,
              top: 20,
              bottom: 10
            }
          },
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 16,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 10
              }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 15,
                boxWidth: 12,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  return `${context.dataset.label}: ${new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(context.raw)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Monto Total (€)',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              },
              ticks: {
                padding: 5,
                font: {
                  size: 10
                },
                callback: (tickValue: string | number) => {
                  return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(Number(tickValue));
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Día del Mes',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              },
              ticks: {
                padding: 5,
                font: {
                  size: 10
                }
              },
              grid: {
                display: false
              }
            }
          }
        }
      };

      this._chart = new Chart(this.ctx, config);
      console.log('Line chart created successfully');
      return this._chart;
    } catch (error) {
      console.error('Error creating line chart:', error);
      return null;
    }
  }
}