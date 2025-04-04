import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrdersInvoiceViewModelService } from '../../../../view-model/orders-invoice-viewmodel.service';
import { Subject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TmModel } from '../../../../../domain/use-cases/get-all-monthly-tm.use-case';

interface ChartConfiguration {
  type: string;
  data: any;
  options: any;
}

declare const Chart: {
  new (ctx: CanvasRenderingContext2D, config: ChartConfiguration): any;
};

@Component({
  selector: 'app-chart-tm',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-tm.component.html',
  styleUrl: './chart-tm.component.scss'
})
export class ChartTmComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  private currentData: TmModel[] = [];
  private isBrowser: boolean;
  years: number[] = [];
  
  private readonly chartColors = [
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

  private readonly chartBorderColors = [
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
    public readonly ordersInvoiceViewModel: OrdersInvoiceViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const tmList = this.ordersInvoiceViewModel.monthlyTmList$();
      if (tmList && tmList.length > 0) {
        this.currentData = tmList;
        this.dataLoaded = true;
        
        this.updateAvailableYears(tmList);
        
        const selectedYear = this.ordersInvoiceViewModel.selectedTmYear$();
        if (this.years.length > 0 && !this.years.includes(selectedYear)) {
          this.ordersInvoiceViewModel.setSelectedTmYear(this.years[0]);
        }
        
        const filteredData = this.filterDataByYear(tmList, selectedYear);
        if (this.chartInitialized) {
          this.updateChart(filteredData);
        }
      }
    });
  }

  ngOnInit(): void {
    this.ordersInvoiceViewModel.loadMonthlyTmList();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initChart();
        this.chartInitialized = true;
        
        if (this.currentData.length > 0) {
          const selectedYear = this.ordersInvoiceViewModel.selectedTmYear$();
          this.updateChart(this.filterDataByYear(this.currentData, selectedYear));
        }
      }, 500); 
    }
  }

  onYearChange(event: any): void {
    if (event.value) {
      this.ordersInvoiceViewModel.setSelectedTmYear(event.value);
      if (this.currentData.length > 0) {
        this.updateChart(this.filterDataByYear(this.currentData, event.value));
      }
    }
  }

  private updateAvailableYears(data: TmModel[]): void {
    const uniqueYears = [...new Set(data.map(item => item.year))];
    this.years = uniqueYears.sort((a, b) => b - a);
  }

  private filterDataByYear(data: TmModel[], year: number): TmModel[] {
    return data.filter(item => item.year === year);
  }

  private initChart(): void {
    if (!this.isBrowser) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
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
              label: (context: any) => {
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
              callback: (value: number) => {
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
    };

    this.chart = new Chart(ctx, config);
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
