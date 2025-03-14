import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';

// Importamos todos los casos de uso
import { GetClientsByCountryUseCase } from '../../domain/use-cases/get-clients-by-country.use-case';
import { GetTopClientsRevenueUseCase } from '../../domain/use-cases/get-top-clients-revenue.use-case';
import { GetAverageOrderValueUseCase } from '../../domain/use-cases/get-average-order-value.use-case';
import { GetRevenueByCountryUseCase } from '../../domain/use-cases/get-revenue-by-country.use-case';
import { GetTopClientsMetricsUseCase } from '../../domain/use-cases/get-top-clients-metrics.use-case';
import { GetOrdersByCountryUseCase } from '../../domain/use-cases/get-orders-by-country.use-case';
import { GetOrdersVsRevenueUseCase } from '../../domain/use-cases/get-orders-vs-revenue.use-case';
import { GetClientMetricsBubbleUseCase } from '../../domain/use-cases/get-client-metrics-bubble.use-case';
import { GetCumulativeRevenueUseCase } from '../../domain/use-cases/get-cumulative-revenue.use-case';
import { GetMixedRevenueMetricsUseCase } from '../../domain/use-cases/get-mixed-revenue-metrics.use-case';

@Component({
  selector: 'app-clients-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients-charts.component.html',
  styleUrls: ['./clients-charts.component.css']
})
export class ClientsChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('polarChart') polarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('scatterChart') scatterChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bubbleChart') bubbleChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('areaChart') areaChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mixedChart') mixedChartRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private isBrowser: boolean;

  private colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#7CBA3B', '#B276B2', '#5DA5DA', '#FAA43A'
  ];

  constructor(
    private clientsByCountryUseCase: GetClientsByCountryUseCase,
    private topClientsRevenueUseCase: GetTopClientsRevenueUseCase,
    private averageOrderValueUseCase: GetAverageOrderValueUseCase,
    private revenueByCountryUseCase: GetRevenueByCountryUseCase,
    private topClientsMetricsUseCase: GetTopClientsMetricsUseCase,
    private ordersByCountryUseCase: GetOrdersByCountryUseCase,
    private ordersVsRevenueUseCase: GetOrdersVsRevenueUseCase,
    private clientMetricsBubbleUseCase: GetClientMetricsBubbleUseCase,
    private cumulativeRevenueUseCase: GetCumulativeRevenueUseCase,
    private mixedRevenueMetricsUseCase: GetMixedRevenueMetricsUseCase,
    @Inject(PLATFORM_ID) platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('Constructor - isBrowser:', this.isBrowser);
  }

  ngOnInit() {
    console.log('ngOnInit - Inicio');
    if (this.isBrowser) {
      this.loadCharts();
    }
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit - Inicio');
    if (this.isBrowser) {
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    }
  }

  private loadCharts() {
    // Destruir gráficos existentes
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    // Cargar datos para cada gráfico
    this.clientsByCountryUseCase.execute().subscribe({
      next: data => this.createPieChart(data)
    });

    this.topClientsRevenueUseCase.execute(5).subscribe({
      next: data => this.createBarChart(data)
    });

    this.averageOrderValueUseCase.execute().subscribe({
      next: data => this.createLineChart(data)
    });

    this.revenueByCountryUseCase.execute().subscribe({
      next: data => this.createDoughnutChart(data)
    });

    this.topClientsMetricsUseCase.execute(3).subscribe({
      next: data => this.createRadarChart(data)
    });

    this.ordersByCountryUseCase.execute().subscribe({
      next: data => this.createPolarChart(data)
    });

    this.ordersVsRevenueUseCase.execute().subscribe({
      next: data => this.createScatterChart(data)
    });

    this.clientMetricsBubbleUseCase.execute().subscribe({
      next: data => this.createBubbleChart(data)
    });

    this.cumulativeRevenueUseCase.execute().subscribe({
      next: data => this.createAreaChart(data)
    });

    this.mixedRevenueMetricsUseCase.execute().subscribe({
      next: data => this.createMixedChart(data)
    });
  }

  private initializeCharts() {
    this.loadCharts();
  }

  // Métodos de creación de gráficos actualizados para usar los datos de los casos de uso

  private createPieChart(data: { labels: string[], data: number[] }) {
    if (!this.pieChartRef?.nativeElement) return;
    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
  
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: this.colors.slice(0, data.labels.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 25, // Aumentado de 20 a 25
          borderRadius: 5, // Aumentado de 4 a 5
          spacing: 3, // Aumentado de 2 a 3
          offset: 5, // Aumentado de 4 a 5
          weight: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -90,
        circumference: 360,
        layout: {
          padding: {
            left: 30, // Aumentado de 20 a 30
            right: 150, // Aumentado de 120 a 150
            top: 20, // Aumentado de 10 a 20
            bottom: 20 // Aumentado de 10 a 20
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'right' as const,
            align: 'center',
            title: {
              display: true,
              text: 'Países',
              font: {
                size: 16, // Aumentado de 14 a 16
                weight: 'bold'
              }
            },
            labels: {
              boxWidth: 18, // Aumentado de 15 a 18
              boxHeight: 18, // Aumentado de 15 a 18
              padding: 18, // Aumentado de 15 a 18
              font: {
                size: 14, // Aumentado de 13 a 14
                weight: 500
              }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 16 }, // Aumentado de 14 a 16
            bodyFont: { size: 15 }, // Aumentado de 13 a 15
            padding: 15, // Aumentado de 12 a 15
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                const label = context.label?.split(':')[0] || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                const percentage = ((value * 100) / total).toFixed(1);
                return ` ${label}: ${value} clientes (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createBarChart(data: { labels: string[], data: number[] }) {
    if (!this.barChartRef?.nativeElement) return;
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Ingresos Totales (€)',
          data: data.data,
          backgroundColor: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Euros (€)'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createLineChart(data: { labels: string[], data: number[] }) {
    if (!this.lineChartRef?.nativeElement) return;
    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Valor Medio de Pedido (€)',
          data: data.data,
          borderColor: '#FF6384',
          tension: 0.1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Euros (€)'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createDoughnutChart(data: { labels: string[], data: number[] }) {
    if (!this.doughnutChartRef?.nativeElement) return;
    const ctx = this.doughnutChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: this.colors,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          title: {
            display: true,
            text: 'Ingresos por País'
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createRadarChart(data: { metricLabels: string[], clientsData: Array<{ label: string, metrics: number[] }> }) {
    if (!this.radarChartRef?.nativeElement) return;
    const ctx = this.radarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.metricLabels,
        datasets: data.clientsData.map((client, index) => ({
          label: client.label,
          data: client.metrics,
          borderColor: this.colors[index],
          backgroundColor: `${this.colors[index]}33`,
          pointBackgroundColor: this.colors[index],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: this.colors[index]
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
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
                const label = context.dataset.label;
                const value = context.raw.toFixed(1);
                return `${label}: ${value}%`;
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value: any) => `${value}%`
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createPolarChart(data: { labels: string[], data: number[] }) {
    if (!this.polarChartRef?.nativeElement) return;
    const ctx = this.polarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: this.colors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          title: {
            display: true,
            text: 'Pedidos por País'
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createScatterChart(data: { data: Array<{ x: number, y: number }> }) {
    if (!this.scatterChartRef?.nativeElement) return;
    const ctx = this.scatterChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Pedidos vs Ingresos',
          data: data.data,
          backgroundColor: this.colors[0]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Cantidad de Pedidos'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Importe Total (€)'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createBubbleChart(data: { data: Array<{ x: number, y: number, r: number }> }) {
    if (!this.bubbleChartRef?.nativeElement) return;
    const ctx = this.bubbleChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Métricas de Cliente',
          data: data.data,
          backgroundColor: this.colors.map(color => `${color}88`)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
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
                const point = context.raw;
                return [
                  `Pedidos: ${point.x}`,
                  `Ingresos: ${point.y.toFixed(2)}€`,
                  `Valor medio: ${(point.r * 20).toFixed(2)}€`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Cantidad de Pedidos'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Importe Total (€)'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createAreaChart(data: { labels: string[], data: number[] }) {
    if (!this.areaChartRef?.nativeElement) return;
    const ctx = this.areaChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Ingresos Totales Acumulados',
          data: data.data,
          borderColor: this.colors[1],
          backgroundColor: `${this.colors[1]}33`,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Euros (€)'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createMixedChart(data: { labels: string[], totalRevenue: number[], averageRevenue: number[] }) {
    if (!this.mixedChartRef?.nativeElement) return;
    const ctx = this.mixedChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Ingresos Totales',
            data: data.totalRevenue,
            backgroundColor: `${this.colors[1]}88`,
            order: 2
          },
          {
            type: 'line',
            label: 'Valor Medio de Pedido',
            data: data.averageRevenue,
            borderColor: this.colors[0],
            backgroundColor: `${this.colors[0]}88`,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Euros (€)'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }
}
