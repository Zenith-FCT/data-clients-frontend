import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { InvoiceClientsViewModelService } from '../../../../view-model/invoice-clients-viewmodel.service';
import { InvoiceClientsTypeModel } from '../../../../../domain/models/invoice-clients-type.model';

declare const Chart: any;

@Component({
  selector: 'app-orders-client-type',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './orders-client-type.component.html',
  styleUrl: './orders-client-type.component.css'
})
export class OrdersClientTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private isBrowser: boolean;

  constructor(
    public invoiceClientsViewModel: InvoiceClientsViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    effect(() => {
      const clientsData = this.invoiceClientsViewModel.ordersClientsType$();
      if (clientsData && clientsData.length > 0) {
        this.extractAvailableYears(clientsData);
        this.updateChart();
      }
    });
    
    effect(() => {
      const selectedYear = this.invoiceClientsViewModel.selectedYear$();
      if (selectedYear !== this.selectedYear) {
        this.selectedYear = selectedYear;
        this.updateChart();
      }
    });
  }

  ngOnInit(): void {
    this.invoiceClientsViewModel.loadOrdersClientsType();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  private extractAvailableYears(data: InvoiceClientsTypeModel[]): void {
    const uniqueYears = new Set<number>();
    
    data.forEach(item => {
      const year = parseInt(item.date);
      if (!isNaN(year)) {
        uniqueYears.add(year);
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
      this.updateChart();
    }
  }

  private updateChart(): void {
    const clientsData = this.invoiceClientsViewModel.ordersClientsType$();
    if (!clientsData || clientsData.length === 0) return;
    
    const yearData = clientsData.filter(item => parseInt(item.date) === this.selectedYear);
    if (yearData.length === 0) return;
    
    const clientData = yearData[0];
    
    this.destroyAndRecreateChart(clientData);
  }

  private destroyAndRecreateChart(clientData: InvoiceClientsTypeModel): void {
    if (!this.isBrowser) return;
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      const recurring = parseInt(clientData.totalRecurrentOrders);
      const unique = parseInt(clientData.totalUniqueOrders);
      
      if (isNaN(recurring) || isNaN(unique)) {
        console.error('Los datos del cliente no son válidos:', clientData);
        return;
      }
      
      const total = recurring + unique;
      if (total === 0) {
        console.warn('No hay datos para mostrar (total es 0)');
        return;
      }
      
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Pedidos de Clientes Recurrentes', 'Pedidos de Clientes Únicos'],
          datasets: [
            {
              data: [recurring, unique],
              backgroundColor: ['#000000', '#FE2800'],
              hoverBackgroundColor: ['#000000', '#b33838'],
              borderWidth: 1,
              borderColor: '#fff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const value = context.raw;
                  const percentage = Math.round((value / total) * 100);
                  return `${value.toLocaleString('es-ES')} pedidos (${percentage}%)`;
                }
              }
            }
          },
          cutout: '30%',
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
