import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MonthlySalesViewModelService } from '../../../../view-model/monthly-orders-viewmodel.service';
import { Subject, takeUntil } from 'rxjs';
import { MonthlySalesModel } from '../../../../../domain/models/monthly-sales.model';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
declare const Chart: any;

@Component({
  selector: 'app-chart-total-invoice',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-total-invoice.component.html',
  styleUrl: './chart-total-invoice.component.css'
})
export class ChartTotalInvoiceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  selectedYear!: number;
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  private currentData: MonthlySalesModel[] = [];
  private isBrowser: boolean;

  constructor(
    private monthlySalesViewModel: MonthlySalesViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.monthlySalesViewModel.selectedYear$
      .pipe(takeUntil(this.destroy$))
      .subscribe(year => {
        this.selectedYear = year;
        if (this.chart && this.currentData) {
          this.updateChart(this.filterDataByYear(this.currentData));
        }
      });

    this.monthlySalesViewModel.allMonthlySales$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.currentData = data;
        if (this.chart) {
          this.updateChart(this.filterDataByYear(data));
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initChart();
    }
    this.monthlySalesViewModel.loadAllMonthWithTotals();
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
    }
    if (this.chart && this.currentData) {
      this.updateChart(this.filterDataByYear(this.currentData));
    }
  }

  private filterDataByYear(data: MonthlySalesModel[]): MonthlySalesModel[] {
    return data.filter(item => item.date.startsWith(this.selectedYear.toString()));
  }

  private initChart(): void {
    if (!this.isBrowser) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          label: 'Ventas Mensuales',
          data: [],
          borderColor: '#FE2800',
          backgroundColor: 'transparent',
          tension: 0,
          fill: false,
          pointRadius: 5,
          pointBackgroundColor: '#FE2800'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'nearest',
          axis: 'xy'
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
              size: 12
            },
            padding: 10,
            callbacks: {
              label: function(context: any) {
                let value = context.parsed.y;
                return value.toLocaleString('es-ES') + ' €';
              }
            }
          }
        },
        elements: {
          point: {
            hitRadius: 15,
            hoverRadius: 7,
            radius: 5
          },
          line: {
            tension: 0.2
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value: number): string {
                return  value.toLocaleString('es-ES')+ '€';
              },
              font: {
                size: 11
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          }
        }
      }
    });
  }

  private updateChart(data: MonthlySalesModel[]): void {
    if (!this.isBrowser || !this.chart) return;

    const values = Array(12).fill(0);
    data.forEach(item => {
      const month = parseInt(item.date.split('-')[1]) - 1;
      values[month] = parseFloat(item.totalSales);
    });

    this.chart.data.datasets[0].data = values;
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
