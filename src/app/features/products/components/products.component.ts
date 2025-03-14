import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ProductMockService } from '../data/product-mock.service';
import { Product } from '../domain/product';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueByProductChart') revenueByProductChart!: ElementRef;
  @ViewChild('salesByProductChart') salesByProductChart!: ElementRef;
  @ViewChild('topProductsChart') topProductsChart!: ElementRef;
  @ViewChild('monthlyTopProductsChart') monthlyTopProductsChart!: ElementRef;
  @ViewChild('revenueEvolutionChart') revenueEvolutionChart!: ElementRef;
  @ViewChild('topRevenueProductsChart') topRevenueProductsChart!: ElementRef;
  @ViewChild('productComparisonChart') productComparisonChart!: ElementRef;

  products: Product[] = [];
  topMonthlyProducts: { month: string, year: number, products: { product: Product, quantity: number, revenue: number }[] }[] = [];
  selectedMonth: { month: string, year: number } = { month: '', year: 0 };
  productMetricsData: { product: Product, quantity: number, revenue: number }[] = [];
  
  // Flag to check if code is running in browser
  private isBrowser: boolean;

  // Colores para los gráficos con mejor contraste y visibilidad
  chartColors = [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
    '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
  ];

  // Opciones globales de Chart.js para mejorar la calidad
  defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,  // Importante: mantener proporciones de aspecto
    devicePixelRatio: 2,        // Mejora la resolución de los gráficos
    layout: {
      padding: {
        top: 5,
        right: 15,
        bottom: 5,
        left: 10
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };

  constructor(
    private productService: ProductMockService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadTopMonthlyProducts();
    this.loadProductMetricsData();
  }

  ngAfterViewInit(): void {
    // Only run chart creation in browser environment
    if (this.isBrowser) {
      // Usar un timeout más largo para asegurar que los elementos del DOM están listos
      setTimeout(() => {
        this.createRevenueByProductChart();
        this.createSalesByProductChart();
        this.createTopProductsChart();
        this.createMonthlyTopProductsChart();
        this.createRevenueEvolutionChart();
        this.createTopRevenueProductsChart();
        this.createProductComparisonChart();
      }, 300);
    }
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  loadTopMonthlyProducts(): void {
    this.productService.getMostSoldProductsByMonth(5).subscribe(data => {
      this.topMonthlyProducts = data;
      if (data.length > 0) {
        this.selectedMonth = { 
          month: data[data.length - 1].month, 
          year: data[data.length - 1].year 
        };
      }
    });
  }

  loadProductMetricsData(): void {
    this.productService.getMostSoldProducts(10).subscribe(data => {
      this.productMetricsData = data;
    });
  }

  createRevenueByProductChart(): void {
    if (!this.isBrowser) return;

    this.productService.getTotalRevenueByProduct().subscribe(data => {
      if (data.length === 0 || !this.revenueByProductChart) return;

      const labels = data.map(item => item.product.name);
      const values = data.map(item => item.revenue);
      
      new Chart(this.revenueByProductChart.nativeElement, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: this.chartColors,
            hoverBackgroundColor: this.chartColors.map(c => this.adjustBrightness(c, 0.8)),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.5,  // Proporción ancho:alto para gráficos circulares
          plugins: {
            legend: {
              position: 'right',
              align: 'start',
              labels: {
                boxWidth: 15,
                font: { size: 11 },
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${value.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}`;
                }
              }
            }
          }
        }
      });
    });
  }

  createSalesByProductChart(): void {
    if (!this.isBrowser) return;

    this.productService.getTotalSalesByProduct().subscribe(data => {
      if (data.length === 0 || !this.salesByProductChart) return;

      const labels = data.map(item => item.product.name);
      const values = data.map(item => item.quantity);
      
      new Chart(this.salesByProductChart.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad Vendida',
            data: values,
            backgroundColor: this.chartColors.map(c => this.adjustBrightness(c, 0.9)),
            borderColor: this.chartColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.7,
          indexAxis: 'y', // Barras horizontales para mejor visualización de nombres largos
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: { 
                font: { size: 10 } 
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: { 
                font: { size: 10 } 
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Ventas: ${context.parsed.x} unidades`;
                }
              }
            }
          }
        }
      });
    });
  }

  createTopProductsChart(): void {
    if (!this.isBrowser) return;

    this.productService.getMostSoldProducts(5).subscribe(data => {
      if (data.length === 0 || !this.topProductsChart) return;
      
      const labels = data.map(item => item.product.name);
      const salesValues = data.map(item => item.quantity);
      const revenueValues = data.map(item => item.revenue / 1000);
      
      new Chart(this.topProductsChart.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Unidades',
              data: salesValues,
              backgroundColor: this.chartColors[0] + 'CC',
              borderColor: this.chartColors[0],
              borderWidth: 1,
              barPercentage: 0.7,
              order: 2
            },
            {
              label: 'Ingresos (K€)',
              data: revenueValues,
              backgroundColor: 'rgba(0,0,0,0)',
              borderColor: this.chartColors[1],
              borderWidth: 2,
              type: 'line',
              pointBackgroundColor: this.chartColors[1],
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.1,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.7,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: { 
                font: { size: 10 } 
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: { 
                font: { size: 10 } 
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'center',
              labels: { 
                font: { size: 11 },
                boxWidth: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          }
        }
      });
    });
  }

  createMonthlyTopProductsChart(): void {
    if (!this.isBrowser) return;
    this.updateMonthlyTopProductsChart(this.selectedMonth);
  }

  updateMonthlyTopProductsChart(selectedPeriod: { month: string, year: number }): void {
    if (!this.isBrowser) return;

    const monthData = this.topMonthlyProducts.find(
      item => item.month === selectedPeriod.month && item.year === selectedPeriod.year
    );

    if (!monthData || monthData.products.length === 0 || !this.monthlyTopProductsChart) return;

    const chartInstance = Chart.getChart(this.monthlyTopProductsChart.nativeElement);
    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = monthData.products.map(item => item.product.name);
    const values = monthData.products.map(item => item.quantity);

    new Chart(this.monthlyTopProductsChart.nativeElement, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: this.chartColors.slice(0, labels.length).map(c => this.adjustBrightness(c, 0.9)),
          borderColor: this.chartColors.slice(0, labels.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        scales: {
          r: {
            ticks: {
              display: false
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'right',
            align: 'start',
            labels: {
              boxWidth: 12,
              font: { size: 10 },
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                return `${label}: ${value} unidades`;
              }
            }
          },
          title: {
            display: true,
            text: `${monthData.month} ${monthData.year}`,
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: {
              top: 0,
              bottom: 10
            }
          }
        }
      }
    });
  }

  createRevenueEvolutionChart(): void {
    if (!this.isBrowser) return;

    this.productService.getMonthlyRevenueEvolution().subscribe(data => {
      if (data.length === 0 || !this.revenueEvolutionChart) return;
      
      const allMonths = new Set<string>();
      data.forEach(product => {
        product.monthlyRevenue.forEach(month => {
          allMonths.add(`${month.month} ${month.year}`);
        });
      });
      
      const monthLabels = Array.from(allMonths).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        
        if (yearA !== yearB) {
          return parseInt(yearA) - parseInt(yearB);
        }
        
        const months = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return months.indexOf(monthA) - months.indexOf(monthB);
      });
      
      const datasets = data.slice(0, 5).map((product, index) => {
        const colorIndex = index % this.chartColors.length;
        
        const revenueData = monthLabels.map(monthLabel => {
          const [month, year] = monthLabel.split(' ');
          const revenue = product.monthlyRevenue.find(
            rev => rev.month === month && rev.year === parseInt(year)
          );
          
          return revenue ? revenue.revenue : 0;
        });
        
        return {
          label: product.product.name,
          data: revenueData,
          borderColor: this.chartColors[colorIndex],
          backgroundColor: this.chartColors[colorIndex] + '20',
          borderWidth: 2,
          pointBackgroundColor: this.chartColors[colorIndex],
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false
        };
      });
      
      new Chart(this.revenueEvolutionChart.nativeElement, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,  // Mejor proporción para gráficos de líneas
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: { 
                font: { size: 10 },
                callback: function(value) {
                  return value.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  });
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: { 
                font: { size: 10 },
                maxRotation: 45,
                minRotation: 45
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'center',
              labels: { 
                font: { size: 10 },
                boxWidth: 12,
                usePointStyle: true
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}`;
                }
              }
            }
          }
        }
      });
    });
  }

  createTopRevenueProductsChart(): void {
    if (!this.isBrowser) return;

    this.productService.getTotalRevenueByProduct().subscribe(data => {
      if (data.length === 0 || !this.topRevenueProductsChart) return;

      const topData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      const labels = topData.map(item => item.product.name);
      const values = topData.map(item => item.revenue);
      
      new Chart(this.topRevenueProductsChart.nativeElement, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: this.chartColors.slice(0, 5),
            hoverBackgroundColor: this.chartColors.slice(0, 5).map(c => this.adjustBrightness(c, 0.8)),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.5,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                boxWidth: 12,
                font: { size: 11 },
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    });
  }

  createProductComparisonChart(): void {
    if (!this.isBrowser) return;

    this.productService.getMostSoldProducts(5).subscribe(data => {
      if (data.length === 0 || !this.productComparisonChart) return;
      
      const productNames = data.map(item => item.product.name);
      const sales = data.map(item => item.quantity);
      const revenues = data.map(item => item.revenue / 10000); 
      const prices = data.map(item => item.product.price / 100);
      const stocks = data.map(item => item.product.stock / 10);
      
      new Chart(this.productComparisonChart.nativeElement, {
        type: 'radar',
        data: {
          labels: ['Ventas', 'Ingresos', 'Precio', 'Stock', 'Ratio Ventas/Stock'],
          datasets: productNames.map((name, idx) => ({
            label: name,
            data: [
              sales[idx], 
              revenues[idx], 
              prices[idx], 
              stocks[idx],
              sales[idx] / (stocks[idx] || 1) * 10
            ],
            backgroundColor: this.chartColors[idx % this.chartColors.length] + '40',
            borderColor: this.chartColors[idx % this.chartColors.length],
            borderWidth: 2,
            pointBackgroundColor: this.chartColors[idx % this.chartColors.length],
            pointRadius: 3,
            pointHoverRadius: 5
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1,  // Proporción cuadrada para el radar
          scales: {
            r: {
              angleLines: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                display: false,
                backdropColor: 'rgba(0, 0, 0, 0)'
              },
              pointLabels: {
                font: { size: 12, weight: 600 },
                color: '#495057'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { 
                font: { size: 11 },
                boxWidth: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.raw as number;
                  const metricIdx = context.dataIndex;
                  
                  if (metricIdx === 0) return `${label}: ${Math.round(value)} unidades`;
                  if (metricIdx === 1) return `${label}: ${(value * 10000).toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}`;
                  if (metricIdx === 2) return `${label}: ${(value * 100).toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}`;
                  if (metricIdx === 3) return `${label}: ${Math.round(value * 10)} unidades`;
                  if (metricIdx === 4) return `${label}: ${value.toFixed(2)}`;
                  
                  return `${label}: ${value}`;
                }
              }
            }
          }
        }
      });
    });
  }

  onMonthSelect(event: Event): void {
    if (!this.isBrowser) return;
    
    const [month, yearStr] = (event.target as HTMLSelectElement).value.split(' ');
    const year = parseInt(yearStr);
    this.selectedMonth = { month, year };
    this.updateMonthlyTopProductsChart(this.selectedMonth);
  }

  // Utilidad para ajustar el brillo de un color
  adjustBrightness(color: string, factor: number): string {
    // Implementación simple para colores hexadecimales
    if (color.startsWith('#')) {
      let r = parseInt(color.substr(1, 2), 16);
      let g = parseInt(color.substr(3, 2), 16);
      let b = parseInt(color.substr(5, 2), 16);
      
      r = Math.min(255, Math.floor(r * factor));
      g = Math.min(255, Math.floor(g * factor));
      b = Math.min(255, Math.floor(b * factor));
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return color;
  }
}
