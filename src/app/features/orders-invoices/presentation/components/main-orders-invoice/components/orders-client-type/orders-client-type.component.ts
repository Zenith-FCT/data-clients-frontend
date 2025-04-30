import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { InvoiceClientsViewModelService } from '../../../../view-model/invoice-clients-viewmodel.service';
import { InvoiceClientsTypeModel } from '../../../../../domain/models/invoice-clients-type.model';

@Component({
  selector: 'app-orders-client-type',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, NgxEchartsModule],
  templateUrl: './orders-client-type.component.html',
  styleUrl: './orders-client-type.component.scss'
})
export class OrdersClientTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  public isBrowser: boolean;
  chartOption: EChartsOption = {};

  constructor(
    public invoiceClientsViewModel: InvoiceClientsViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
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
  }

  ngOnInit(): void {
    this.invoiceClientsViewModel.loadOrdersClientsType();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.updateChart();
      }, 100);
    }
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
    if (!this.isBrowser) return;
    
    const clientsData = this.invoiceClientsViewModel.ordersClientsType$();
    if (!clientsData || clientsData.length === 0) return;
    
    const yearData = clientsData.filter(item => parseInt(item.date) === this.selectedYear);
    if (yearData.length === 0) return;
    
    const clientData = yearData[0];
    
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
    
   
    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const value = params.value;
          const percentage = Math.round((value / total) * 100);
          return `${params.name}: ${value.toLocaleString('es-ES')} pedidos (${percentage}%)`;
        },
        position: 'right', 
        confine: true  
      },
      legend: {
        orient: 'vertical',
        left: 'right',
        padding: 20,
        textStyle: {
          fontSize: 14,
          color: '#ffffff'
        }
      },
      grid: {
        containLabel: true
      },
      series: [
        {
          name: 'Pedidos por Tipo de Cliente',
          type: 'pie',
          radius: '85%',
          center: ['30%', '45%'], 
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: [
            { value: recurring, name: 'Pedidos de Clientes Recurrentes', itemStyle: { color: 'rgba(255, 255, 255, 0.51)' } },
            { value: unique, name: 'Pedidos de Clientes Únicos', itemStyle: { color: 'rgb(31, 31, 31)' } }
          ]
        }
      ]
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
