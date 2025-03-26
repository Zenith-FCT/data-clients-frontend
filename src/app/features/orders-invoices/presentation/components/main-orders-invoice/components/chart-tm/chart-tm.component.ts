import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MonthlySalesViewModelService } from '../../../../view-model/monthly-orders-viewmodel.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TmModel } from '../../../../../domain/use-cases/get-monthly-tm.use-case';
declare const Chart: any;

@Component({
  selector: 'app-chart-tm',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-tm.component.html',
  styleUrl: './chart-tm.component.css'
})
export class ChartTmComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  chartTmSelectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private currentData: TmModel[] = [];
  private isBrowser: boolean;
  
  private chartColors = [
    'rgba(255, 99, 132, 0.2)',   
    'rgba(54, 162, 235, 0.2)', 
    'rgba(255, 206, 86, 0.2)',  
    'rgba(75, 192, 192, 0.2)',  
    'rgba(153, 102, 255, 0.2)', 
    'rgba(255, 159, 64, 0.2)',  
    'rgba(76, 175, 80, 0.2)',  
    'rgba(121, 85, 72, 0.2)',  
    'rgba(233, 30, 99, 0.2)',  
    'rgba(156, 39, 176, 0.2)',  
    'rgba(3, 169, 244, 0.2)', 
    'rgba(255, 87, 34, 0.2)' 
  ];

  private chartBorderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(121, 85, 72, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(3, 169, 244, 1)',
    'rgba(255, 87, 34, 1)'
  ];
  
  dataLoaded = false;
  chartInitialized = false;

  constructor(
    public monthlySalesViewModel: MonthlySalesViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const tmList = this.monthlySalesViewModel.monthlyTmList$();
      if (tmList && tmList.length > 0) {
        this.currentData = tmList;
        this.dataLoaded = true;
        
        this.years = Array.from(new Set(tmList.map(item => item.year))).sort((a, b) => b - a);
        if (this.years.length > 0 && !this.years.includes(this.chartTmSelectedYear)) {
          this.chartTmSelectedYear = this.years[0];
        }
        
        const filteredData = this.filterDataByYear(tmList);
        this.destroyAndRecreateChart(filteredData);
      }
    });
  }

  ngOnInit(): void {
    this.monthlySalesViewModel.loadMonthlyTmList();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initChart();
        this.chartInitialized = true;
        
        if (this.currentData.length > 0) {
          this.updateChart(this.filterDataByYear(this.currentData));
        }
      }, 500); 
    }
  }

  onYearChange(): void {
    if (this.chartTmSelectedYear && this.currentData.length > 0) {
      const filteredData = this.filterDataByYear(this.currentData);
      this.destroyAndRecreateChart(filteredData);
    }
  }

  private filterDataByYear(data: TmModel[]): TmModel[] {
    return data.filter(item => item.year === this.chartTmSelectedYear);
  }

  private initChart(): void {
    if (!this.isBrowser) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          label: 'Ticket Medio',
          data: [],
          backgroundColor: this.chartColors,
          borderColor: this.chartBorderColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
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
                return `Ticket Medio: ${context.parsed.y.toLocaleString('es-ES')} €`;
              }
            }
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
                return value.toLocaleString('es-ES') + ' €';
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
  }

  private destroyAndRecreateChart(data: TmModel[]): void {
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
          datasets: [{
            label: 'Ticket Medio Mensual',
            data: [],
            backgroundColor: this.chartColors,
            borderColor: this.chartBorderColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
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
                  return `Ticket Medio: ${context.parsed.y.toLocaleString('es-ES')} €`;
                }
              }
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
                  return value.toLocaleString('es-ES') + ' €';
                },
                font: {
                  size: 11
                }
              },
              title: {
                display: true,
                text: 'Valor Medio (€)',
                font: {
                  weight: 'bold',
                  size: 14
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
      
      if (this.chart) {
        this.updateChart(data);
      }
    }
  }

  private updateChart(data: TmModel[]): void {
    if (!this.isBrowser || !this.chart) {
      return;
    }

    const values = Array(12).fill(0);
    
    data.forEach(item => {
      const monthIndex = item.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        values[monthIndex] = parseFloat(item.tm);
      }
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
