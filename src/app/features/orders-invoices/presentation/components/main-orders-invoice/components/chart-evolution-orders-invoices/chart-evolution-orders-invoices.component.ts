import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrdersInvoiceViewModelService } from '../../../../view-model/orders-invoice-viewmodel.service';
import { Subject } from 'rxjs';
import { MonthlySalesModel } from '../../../../../domain/models/monthly-sales.model';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

declare const Chart: any;
@Component({
  selector: 'app-chart-evolution-orders-invoices',
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-evolution-orders-invoices.component.html',
  styleUrl: './chart-evolution-orders-invoices.component.scss'
})
export class ChartEvolutionOrdersInvoicesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private currentData: MonthlySalesModel[] = [];
  private isBrowser: boolean;

  constructor(
    public monthlySalesViewModel: OrdersInvoiceViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

   effect(() => {
      const data = this.monthlySalesViewModel.allMonthlySales$();
      if (data && data.length > 0) {
        this.currentData = data;
        this.extractAvailableYears(data);
        this.destroyAndRecreateChart(this.filterDataByYear(data));
      }
    });

    effect(() => {
      const year = this.monthlySalesViewModel.selectedYear$();
      if (year !== this.selectedYear) {
        this.selectedYear = year;
        if (this.currentData.length > 0) {
          this.destroyAndRecreateChart(this.filterDataByYear(this.currentData));
        }
      }
    });
  }

  ngOnInit(): void {
    this.monthlySalesViewModel.refreshData();
  }

  ngAfterViewInit(): void {
    this.monthlySalesViewModel.loadAllMonthWithTotals();
  }

  private extractAvailableYears(data: MonthlySalesModel[]): void {
    const uniqueYears = new Set<number>();
    
    data.forEach(item => {
      const year = parseInt(item.date.split('-')[0]);
      uniqueYears.add(year);
    });
    
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);

    if (this.years.length > 0 && !this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
      if (this.currentData.length > 0) {
        this.destroyAndRecreateChart(this.filterDataByYear(this.currentData));
      }
    }
  }

  private filterDataByYear(data: MonthlySalesModel[]): MonthlySalesModel[] {
    return data.filter(item => item.date.startsWith(this.selectedYear.toString()));
  }

  private destroyAndRecreateChart(data: MonthlySalesModel[]): void {
    if (!this.isBrowser) return;
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          datasets: [
            {
              type: 'line',
              label: 'Total Facturas',
              data: [],
              borderColor: '#2bb84b',
              backgroundColor: 'transparent',
              tension: 0,
              yAxisID: 'y',
              order: 0,
              pointRadius: 5,
              pointBackgroundColor: '#2bb84b'
            },
            {
              type: 'bar',
              label: 'Número de Ventas',
              data: [],
              backgroundColor: 'rgba(65, 75, 218, 0.2)',
              yAxisID: 'y1',
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 30,
              bottom: 20
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            title: {
              display: false
            },
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 12
              },
              bodyFont: {
                size: 14
              },
              callbacks: {
                label: function(context: any) {
                  const value = context.parsed.y;
                  if (context.datasetIndex === 0) {
                    return `Total Facturas: ${value.toLocaleString('es-ES')} €`;
                  } else {
                    return `Número de Ventas: ${value.toLocaleString('es-ES')}`;
                  }
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Total Facturas (€)',
                font: {
                  weight: 'bold',
                  size: 14
                }
              },
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value: any) {
                  return value.toLocaleString('es-ES') + ' €';
                },
                font: {
                  weight: '600'
                }
              },
              suggestedMax: function(context: any) {
                const maxValue = Math.max(...context.chart.data.datasets[0].data);
                return maxValue + 50;
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Número de Ventas',
                font: {
                  weight: 'bold',
                  size: 14
                }
              },
              grid: {
                display: false
              },
              ticks: {
                stepSize: 1,
                callback: function(value: any) {
                  return Math.round(value);
                },
                font: {
                  weight: '600'
                }
              },
              suggestedMax: function(context: any) {
                const maxValue = Math.max(...context.chart.data.datasets[1].data);
                return maxValue + 1;
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12,
                  weight: '600'
                },
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              }
            }
          }
        }
      });
      
      if (this.chart) {
        this.updateChart(data);
      }
    }
  }

  private updateChart(data: MonthlySalesModel[]): void {
    if (!this.isBrowser || !this.chart) return;

    const invoiceValues = Array(12).fill(0);
    const salesNumberValues = Array(12).fill(0);

    data.forEach(item => {
      const month = parseInt(item.date.split('-')[1]) - 1;
      invoiceValues[month] = parseFloat(item.totalSales);
      salesNumberValues[month] = parseInt(item.totalSalesNumber);
    });

    this.chart.data.datasets[0].data = invoiceValues;
    this.chart.data.datasets[1].data = salesNumberValues;
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
