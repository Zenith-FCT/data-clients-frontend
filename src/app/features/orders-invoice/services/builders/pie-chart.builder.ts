import { Chart, ChartConfiguration, ChartEvent, ActiveElement } from 'chart.js';
import { PieChartData } from '../../domain/models/chart.model';
import { AbstractChartBuilder } from './abstract-chart.builder';

/**
 * Builder especializado en la creación de gráficos de pie
 */
export class PieChartBuilder extends AbstractChartBuilder {
  /**
   * Crea un gráfico de pie
   * @param data Datos para el gráfico
   * @param title Título del gráfico
   * @param onClick Función opcional para manejar eventos de clic
   * @returns Instancia de Chart o null si hay error
   */
  public createPieChart(
    data: PieChartData,
    title: string,
    onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  ): Chart | null {
    console.log('Creating pie chart with data:', data);
    
    // Asegurarse de que tenemos datos válidos
    if (!data.labels.length || !data.values.length || data.labels.length !== data.values.length) {
      console.error('Invalid data for pie chart');
      return null;
    }
    
    if (!this.initializeCanvas()) {
      console.error('Failed to initialize canvas for pie chart');
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

      // Configuración específica para un gráfico de pastel
      const config: ChartConfiguration = {
        type: 'pie',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(153, 102, 255, 0.8)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
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
              top: 10,
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
              position: 'right',
              align: 'center',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      };

      // Crear el gráfico
      this._chart = new Chart(this.ctx, config);
      console.log('Pie chart created successfully');
      return this._chart;
    } catch (error) {
      console.error('Error creating pie chart:', error);
      return null;
    }
  }
}