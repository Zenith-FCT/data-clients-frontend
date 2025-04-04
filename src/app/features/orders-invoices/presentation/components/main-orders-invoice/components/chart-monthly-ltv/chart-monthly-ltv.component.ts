import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { LtvViewModelService } from '../../../../view-model/ltv-viewmodel.service';
import { LtvModel } from '../../../../../domain/models/ltv.model';

interface ChartConfiguration {
  type: string;
  data: any;
  options: any;
}

declare const Chart: {
  new (ctx: CanvasRenderingContext2D, config: ChartConfiguration): any;
};

@Component({
  selector: 'app-chart-monthly-ltv',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-monthly-ltv.component.html',
  styleUrl: './chart-monthly-ltv.component.scss'
})
export class ChartMonthlyLTVComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private currentData: LtvModel[] = [];
  private isBrowser: boolean;
  
  private chartColors = [
    'rgba(33, 150, 243, 0.3)',  
    'rgba(156, 39, 176, 0.3)',  
    'rgba(233, 30, 99, 0.3)',    
    'rgba(244, 67, 54, 0.3)',    
    'rgba(255, 152, 0, 0.3)',   
    'rgba(255, 235, 59, 0.3)',  
    'rgba(76, 175, 80, 0.3)',    
    'rgba(0, 150, 136, 0.3)',    
    'rgba(63, 81, 181, 0.3)',   
    'rgba(121, 85, 72, 0.3)',   
    'rgba(158, 158, 158, 0.3)', 
    'rgba(96, 125, 139, 0.3)'    
  ];

  private chartBorderColors = [
    '#2196F3',  
    '#9C27B0',   
    '#E91E63',   
    '#F44336',   
    '#FF9800',   
    '#FFEB3B',   
    '#4CAF50',   
    '#009688',   
    '#3F51B5',   
    '#795548',   
    '#9E9E9E',   
    '#607D8B'    
  ];

  constructor(
    public ltvViewModel: LtvViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const ltvData = this.ltvViewModel.ltv$();
      if (ltvData && ltvData.length > 0) {
        this.currentData = ltvData;
        this.extractAvailableYears(ltvData);
        this.destroyAndRecreateChart(this.filterDataByYear(ltvData));
      }
    });

    effect(() => {
      const year = this.ltvViewModel.selectedYear$();
      if (year !== this.selectedYear) {
        this.selectedYear = year;
        if (this.currentData.length > 0) {
          this.destroyAndRecreateChart(this.filterDataByYear(this.currentData));
        }
      }
    });
  }

  ngOnInit(): void {
    this.ltvViewModel.loadLtv();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initChart();
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.ltvViewModel.setSelectedYear(this.selectedYear);
      if (this.currentData.length > 0) {
        this.destroyAndRecreateChart(this.filterDataByYear(this.currentData));
      }
    }
  }

  private extractAvailableYears(data: LtvModel[]): void {
    const uniqueYears = new Set<number>();
    
    data.forEach(item => {
      const year = parseInt(item.date.split('-')[0]);
      if (!isNaN(year)) {
        uniqueYears.add(year);
      }
    });
    
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);
    
    if (this.years.length > 0 && !this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
      this.ltvViewModel.setSelectedYear(this.selectedYear);
    }
  }

  private filterDataByYear(data: LtvModel[]): LtvModel[] {
    return data.filter(item => item.date.startsWith(this.selectedYear.toString()));
  }

  private initChart(): void {
    if (!this.isBrowser || !this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          label: 'LTV Mensual',
          data: [],
          borderColor: this.chartBorderColors,
          backgroundColor: this.chartColors,
          borderWidth: 1,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: this.chartBorderColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }
        },
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
                const value = context.parsed.y;
                return `LTV: ${value.toLocaleString('es-ES')} €`;
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
              callback: function(value: any) {
                return value.toLocaleString('es-ES') + ' €';
              },
              font: {
                size: 11
              }
            },
            title: {
              display: true,
              text: 'LTV (€)',
              font: {
                weight: 'bold',
                size: 14
              },
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
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

  private destroyAndRecreateChart(data: LtvModel[]): void {
    if (!this.isBrowser) return;
    
    if (this.chart) {
      this.chart.destroy();
    }
    
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      this.initChart();
      this.updateChart(data);
    }
  }

  private updateChart(data: LtvModel[]): void {
    if (!this.isBrowser || !this.chart) return;

    const values = Array(12).fill(0);
    data.forEach(item => {
      const month = parseInt(item.date.split('-')[1]) - 1;
      if (month >= 0 && month < 12) {
        values[month] = parseFloat(item.ltv);
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
