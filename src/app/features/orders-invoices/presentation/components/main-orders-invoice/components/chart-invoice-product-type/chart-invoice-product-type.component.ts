import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { OrderInvoiceProductViewModelService } from '../../../../view-model/order-invoice-product-viewmodel.service';
import { OrderInvoiceProductTypeModel } from '../../../../../domain/models/order-invoice-product-type.model';

@Component({
  selector: 'app-chart-invoice-product-type',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, NgxEchartsModule],
  templateUrl: './chart-invoice-product-type.component.html',
  styleUrl: './chart-invoice-product-type.component.scss'
})
export class ChartInvoiceProductTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  public isBrowser: boolean;
  chartOption: EChartsOption = {};
  
  private colors = ['#000000', '#FF0000', '#808080', '#A9A9A9', '#D3D3D3', '#B22222', '#4B4B4B'];

  constructor(
    public orderInvoiceProductViewModel: OrderInvoiceProductViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
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
    if (!this.isBrowser) return;

    const data = this.orderInvoiceProductViewModel.InvoiceProductType$();
    if (!data || data.length === 0) return;

    const yearData = data.filter(item => new Date(item.date).getFullYear() === this.selectedYear);
    if (yearData.length === 0) return;

    const { productTypes, values } = this.processChartData(yearData);
    
    const chartData = productTypes.map((type, index) => ({
      name: type,
      value: values[index],
      itemStyle: {
        color: this.colors[index % this.colors.length]
      }
    }));

    const total = values.reduce((sum, value) => sum + value, 0);
    
    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const value = params.value;
          const percentage = Math.round((value / total) * 100);
          return `${params.name}: ${value.toLocaleString('es-ES')} € (${percentage}%)`;
        }
      },
      legend: {
        orient: 'vertical',
        right: '2%',
        top: 'top',
        padding: 20,
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Facturación por tipo de producto',
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    };
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
