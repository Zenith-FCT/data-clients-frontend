import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { OrderInvoiceProductViewModelService } from '../../../../view-model/order-invoice-product-viewmodel.service';
import { OrderInvoiceProductTypeModel } from '../../../../../domain/models/order-invoice-product-type.model';

declare const Chart: any;

@Component({
  selector: 'app-chart-invoice-product-type',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-invoice-product-type.component.html',
  styleUrl: './chart-invoice-product-type.component.scss'
})
export class ChartInvoiceProductTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private isBrowser: boolean;

  constructor(
    public orderInvoiceProductViewModel: OrderInvoiceProductViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    effect(() => {
      const productData = this.orderInvoiceProductViewModel.InvoiceProductType$();
      if (productData && productData.length > 0) {
        this.extractAvailableYears(productData);
        this.updateChart();
      }
    });

    effect(() => {
      const selectedYear = this.orderInvoiceProductViewModel.selectedYear$();
      if (selectedYear !== this.selectedYear) {
        this.selectedYear = selectedYear;
        this.updateChart();
      }
    });
  }

  ngOnInit(): void {
    this.orderInvoiceProductViewModel.loadInvoiceProductType();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.updateChart();
      }, 100);
    }
  }

  private extractAvailableYears(data: OrderInvoiceProductTypeModel[]): void {
    const uniqueYears = new Set<number>();
    data.forEach(item => {
      const year = new Date(item.date).getFullYear();
      if (!isNaN(year)) {
        uniqueYears.add(year);
      }
    });
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);
    if (this.years.length > 0 && !this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.orderInvoiceProductViewModel.setSelectedYear(this.selectedYear);
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.isBrowser || !this.chartCanvas) return;

    const data = this.orderInvoiceProductViewModel.InvoiceProductType$();
    if (!data || data.length === 0) return;

    const yearData = data.filter(item => new Date(item.date).getFullYear() === this.selectedYear);
    if (yearData.length === 0) return;

    this.createChart(yearData);
  }

  private processChartData(data: OrderInvoiceProductTypeModel[]): {
    productTypes: string[],
    values: number[]
  } {
    const productSums = new Map<string, number>();
    
    data.forEach(item => {
      const currentSum = productSums.get(item.productType) || 0;
      const value = parseFloat(item.invoiceProductType);
      if (!isNaN(value)) {
        productSums.set(item.productType, currentSum + value);
      }
    });

    const productTypes = Array.from(productSums.keys());
    const values = productTypes.map(type => productSums.get(type) || 0);

    return { productTypes, values };
  }

  private createChart(data: OrderInvoiceProductTypeModel[]): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const { productTypes, values } = this.processChartData(data);

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: productTypes,
        datasets: [{
          data: values,
          backgroundColor: ['#000000', '#FF0000', '#808080', '#A9A9A9', '#D3D3D3', '#B22222', '#4B4B4B'],
          hoverBackgroundColor: ['#000000', '#FF0000', '#808080', '#A9A9A9', '#D3D3D3', '#B22222', '#4B4B4B']
    }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'left',
            labels: {
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any): string => {
                const value = context.raw;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${value.toLocaleString('es-ES')} € (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
