import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { InvoiceClientsViewModelService } from '../../../../view-model/invoice-clients-viewmodel.service';
import { InvoiceClientsTypeModel } from '../../../../../domain/models/invoice-clients-type.model';
declare const Chart: any;

@Component({
  selector: 'app-chart-orders-by-client-type',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-orders-by-client-type.component.html',
  styleUrl: './chart-orders-by-client-type.component.scss'
})
export class ChartOrdersByClientTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private currentData: InvoiceClientsTypeModel[] = [];
  private isBrowser: boolean;

  constructor(
    public invoiceClientsViewModel: InvoiceClientsViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const data = this.invoiceClientsViewModel.ordersByClientsMonthly$();
      if (data && data.length > 0) {
        this.currentData = data;
        this.extractAvailableYears(data);
        this.destroyAndRecreateChart(this.filterDataByYear(data));
      }
    });

    effect(() => {
      const year = this.invoiceClientsViewModel.selectedYear$();
      if (year && year !== this.selectedYear) {
        this.selectedYear = year;
        if (this.currentData.length > 0) {
          this.destroyAndRecreateChart(this.filterDataByYear(this.currentData));
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.invoiceClientsViewModel.loadOrdersByClientsMonthly();
    }
  }

  ngAfterViewInit(): void {
    this.invoiceClientsViewModel.loadOrdersByClientsMonthly();
  }

  private extractAvailableYears(data: InvoiceClientsTypeModel[]): void {
    const uniqueYears = new Set<number>();
    
    data.forEach(item => {
      const dateComponents = item.date.split('-');
      if (dateComponents.length > 0) {
        const year = parseInt(dateComponents[0]);
        if (!isNaN(year)) {
          uniqueYears.add(year);
        }
      }
    });
    
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);

    if (this.years.length > 0 && !this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
      this.invoiceClientsViewModel.setSelectedYear(this.selectedYear);
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.invoiceClientsViewModel.setSelectedYear(this.selectedYear);
      if (this.currentData.length > 0) {
        this.destroyAndRecreateChart(this.filterDataByYear(this.currentData));
      }
    }
  }

  private filterDataByYear(data: InvoiceClientsTypeModel[]): InvoiceClientsTypeModel[] {
    return data.filter(item => {
      const dateComponents = item.date.split('-');
      if (dateComponents.length > 0) {
        const year = parseInt(dateComponents[0]);
        return year === this.selectedYear;
      }
      return false;
    });
  }

  private destroyAndRecreateChart(data: InvoiceClientsTypeModel[]): void {
    if (!this.isBrowser || !this.chartCanvas?.nativeElement) return;
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const monthlyData = this.organizeDataByMonth(data);
    
    setTimeout(() => {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          datasets: [
            {
              label: 'Clientes Recurrentes',
              data: monthlyData.recurrentOrders,
              backgroundColor: '#C0C0C0',
              borderColor: '#C0C0C0',
              borderWidth: 1
            },
            {
              label: 'Clientes Únicos',
              data: monthlyData.uniqueOrders,
              backgroundColor: '#FE2800',
              borderColor: '#FE2800',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 20,
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
              display: true,
              position: 'top',
              labels: {
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 12
              },
              bodyFont: {
                size: 12
              },
              callbacks: {
                label: function(context: any) {
                  const value = context.parsed.y;
                  if (context.datasetIndex === 0) {
                    return `Clientes Recurrentes: ${value.toLocaleString('es-ES')}`;
                  } else {
                    return `Clientes Únicos: ${value.toLocaleString('es-ES')}`;
                  }
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Número de Pedidos',
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
                stepSize: 1,
                callback: function(value: any) {
                  return Math.round(value);
                },
                font: {
                  weight: '600'
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }, 0);
  }

  private organizeDataByMonth(data: InvoiceClientsTypeModel[]): { recurrentOrders: number[], uniqueOrders: number[] } {
    const recurrentOrders = Array(12).fill(0);
    const uniqueOrders = Array(12).fill(0);

    data.forEach(item => {
      const dateComponents = item.date.split('-');
      if (dateComponents.length > 1) {
        const month = parseInt(dateComponents[1]) - 1; 
        if (month >= 0 && month < 12) {
          recurrentOrders[month] += parseInt(item.totalRecurrentOrders) || 0;
          uniqueOrders[month] += parseInt(item.totalUniqueOrders) || 0;
        }
      }
    });

    return { recurrentOrders, uniqueOrders };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
