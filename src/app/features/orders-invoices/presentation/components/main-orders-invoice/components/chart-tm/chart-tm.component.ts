import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MonthlySalesViewModelService } from '../../../../view-model/monthly-orders-viewmodel.service';
import { Subject } from 'rxjs';
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
  selectedYear: number = new Date().getFullYear();
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  private currentData: TmModel[] = [];
  private isBrowser: boolean;
  
  // Variables para depuración
  dataLoaded = false;
  chartInitialized = false;

  constructor(
    public monthlySalesViewModel: MonthlySalesViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const year = this.monthlySalesViewModel.selectedYear$();
      this.selectedYear = year;
      if (this.currentData.length > 0) {
        this.destroyAndRecreateChart(this.filterDataByYear(this.currentData));
      }
    });

    effect(() => {
      const tmList = this.monthlySalesViewModel.monthlyTmList$();
      if (tmList && tmList.length > 0) {
        console.log('Datos TM recibidos:', tmList);
        this.currentData = tmList;
        this.dataLoaded = true;
        
        // Verificar si hay datos para el año seleccionado
        const filteredData = this.filterDataByYear(tmList);
        console.log('Datos filtrados por año:', filteredData);
        
        this.destroyAndRecreateChart(filteredData);
      } else {
        console.log('No se recibieron datos de TM o la lista está vacía');
      }
    });
  }

  ngOnInit(): void {
    console.log('ChartTmComponent inicializado');
    // Cargar los datos de TM explícitamente
    this.monthlySalesViewModel.loadMonthlyTmList();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      console.log('Inicializando gráfico TM');
      setTimeout(() => {
        this.initChart();
        this.chartInitialized = true;
        
        // Si ya tenemos datos cuando se inicializa el gráfico, actualizarlo
        if (this.currentData.length > 0) {
          console.log('Actualizando gráfico con datos existentes después de inicialización');
          this.updateChart(this.filterDataByYear(this.currentData));
        }
      }, 500); // Pequeño retraso para asegurar que el canvas esté listo
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      console.log('Año seleccionado cambiado a:', this.selectedYear);
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
      if (this.currentData.length > 0) {
        const filteredData = this.filterDataByYear(this.currentData);
        console.log('Datos filtrados después de cambio de año:', filteredData);
        this.destroyAndRecreateChart(filteredData);
      }
    }
  }

  private filterDataByYear(data: TmModel[]): TmModel[] {
    return data.filter(item => item.year === this.selectedYear);
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
          backgroundColor: 'rgba(140, 74, 96, 0.7)',
          borderColor: 'rgba(140, 74, 96, 1)',
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
            backgroundColor: 'rgba(140, 74, 96, 0.7)',
            borderColor: 'rgba(140, 74, 96, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  weight: 'bold',
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
      console.log('No se puede actualizar el gráfico: isBrowser=', this.isBrowser, 'chart=', !!this.chart);
      return;
    }

    const values = Array(12).fill(0);
    console.log('Actualizando gráfico con datos:', data);
    
    // Ordenar los datos por mes
    data.forEach(item => {
      // El mes en el modelo TmModel está basado en 1 (1-12), pero el array es basado en 0 (0-11)
      const monthIndex = item.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        values[monthIndex] = parseFloat(item.tm);
      }
    });

    console.log('Valores finales para el gráfico:', values);
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
