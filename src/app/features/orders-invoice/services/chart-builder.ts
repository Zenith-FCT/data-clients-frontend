import { Chart, ChartConfiguration, ChartEvent, ActiveElement } from 'chart.js';

export interface ChartData {
  labels: string[];
  values: number[];
}

/**
 * @deprecated Esta clase será eliminada en futuras versiones. 
 * Por favor usar BarChartBuilder para gráficos de barras.
 * La funcionalidad se ha reemplazado con builders específicos para cada tipo de gráfico.
 */
export class ChartBuilder {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private _chart: Chart | null = null;

  constructor(private canvasId: string) {
    console.warn('ChartBuilder está marcada como obsoleta. Por favor use BarChartBuilder para gráficos de barras.');
  }

  get chart(): Chart | null {
    return this._chart;
  }

  private initializeCanvas(): boolean {
    if (this.canvas && this.ctx) {
      return true;
    }

    console.log('Initializing canvas with id:', this.canvasId);
    const canvas = document.getElementById(this.canvasId);
    
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      console.error(`Canvas with id ${this.canvasId} not found or is not a canvas element`);
      return false;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Failed to get 2D context from canvas');
      return false;
    }

    this.canvas = canvas;
    this.ctx = context;
    return true;
  }

  /**
   * @deprecated Use BarChartBuilder.createBarChart() en su lugar
   */
  public createBarChart(
    data: ChartData, 
    title: string,
    onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  ): Chart | null {
    console.warn('ChartBuilder.createBarChart está marcado como obsoleto. Por favor use BarChartBuilder.createBarChart()');
    console.log('Creating bar chart with data:', data);
    
    if (!this.initializeCanvas()) {
      return null;
    }

    if (this._chart) {
      console.log('Destroying existing chart');
      this._chart.destroy();
      this._chart = null;
    }

    try {
      if (!this.ctx || !this.canvas) {
        throw new Error('Canvas context not available after initialization');
      }

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
      console.log('Chart created successfully');
      return this._chart;
    } catch (error) {
      console.error('Error creating chart:', error);
      return null;
    }
  }

  public destroy(): void {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
    // Limpiar las referencias del canvas
    this.canvas = null;
    this.ctx = null;
  }
}