import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { InvoiceClientsViewModelService } from '../../../../view-model/invoice-clients-viewmodel.service';
import { InvoiceClientsTypeModel } from '../../../../../domain/models/invoice-clients-type.model';
import { color } from 'echarts';
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
    });    effect(() => {
      const year = this.invoiceClientsViewModel.selectedYear$();
      if (year && year !== this.selectedYear) {
        this.selectedYear = year;
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
    
    if (this.isBrowser && this.chartCanvas?.nativeElement) {
      const canvas = this.chartCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      
      if (ctx && window.devicePixelRatio > 1) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
    }
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
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const maxValue = Math.max(
      ...monthlyData.recurrentOrders, 
      ...monthlyData.uniqueOrders
    );
    const yAxisMax = Math.ceil(maxValue * 1.2);
      setTimeout(() => {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Clientes Recurrentes',
              data: monthlyData.recurrentOrders,
              backgroundColor: '#b5b5b5',
              borderColor: '#b5b5b5',
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.8,
              categoryPercentage: 0.8
            },
            {
              label: 'Clientes Únicos',
              data: monthlyData.uniqueOrders,
              backgroundColor: '#FE2800',
              borderColor: '#FE2800',
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.8,
              categoryPercentage: 0.8,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 20,
              right: 25,
              bottom: 20,
              left: 15
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
              align: 'center',
              labels: {
                boxWidth: 15,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                padding: 15,
                font: {
                  size: 14,
                  color: '#000000'
                },
                color: '#000000'
              }
            },            
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              titleColor: '#000000',
              bodyColor: '#000000',
              titleFont: {
                size: 13,
                weight: 'bold'
              },
              bodyFont: {
                size: 14
              },
              padding: 10,
              cornerRadius: 4,
              displayColors: true,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              callbacks: {
                title: function(tooltipItems: any) {
                  return months[tooltipItems[0].dataIndex];
                },
                label: function(context: any) {
                  const value = context.parsed.y;
                  if (context.datasetIndex === 0) {
                    return `Clientes Recurrentes: ${value.toLocaleString('es-ES')}`;
                  } else {
                    return `Clientes Únicos: ${value.toLocaleString('es-ES')}`;
                  }
                },
                labelTextColor: function() {
                  return '#000000';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: yAxisMax,
              title: {
                display: true,
                text: 'Número de Pedidos',
                font: {
                  weight: 'bold',
                  size: 16,
                  color: '#000000'
                },
                padding: {
                  bottom: 10
                }
              },
              grid: {
                display: true,
                color: 'rgba(26, 24, 24, 0.18)',
                drawBorder: false
              },
              ticks: {
                stepSize: Math.max(1, Math.ceil(yAxisMax / 6)),
                callback: function(value: any) {
                  return Math.round(value);
                },
                font: {
                  weight: '500'
                },
                padding: 10
              }
            },
            x: {
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                font: {
                  weight: '500'
                },
                padding: 8
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
