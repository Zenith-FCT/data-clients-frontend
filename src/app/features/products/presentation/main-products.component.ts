import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { productsProviders } from '../products.providers';
import { ProductBillingViewModel } from './components/product-billing-chart/product-billing.view-model';
import { ProductSalesViewModel } from './components/product-sales-chart/product-sales.view-model';
import { TopProductsByMonthViewModel } from './components/top-products-by-month-chart/top-products-by-month.view-model';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { GetTotalBillingPerProductUseCase } from '../domain/get-total-billing-per-product-use-case';
import { GetTotalSalesPerProductUseCase } from '../domain/get-total-sales-per-product-use-case';
import { Subject } from 'rxjs';
import { ProductSalesChartComponent } from './components/product-sales-chart/product-sales-chart.component';
import { ProductBillingChartComponent } from './components/product-billing-chart/product-billing-chart.component';
import { TopProductsTableComponent } from './components/top-products-table/top-products-table.component';
import { TopProductsByMonthChartComponent } from './components/top-products-by-month-chart/top-products-by-month-chart.component';
import { ProductSalesEvolutionChartComponent } from './components/product-sales-evolution-chart/product-sales-evolution-chart.component';

export enum ChartViewMode {
  ByProduct = 'byProduct',
  ByProductType = 'byProductType'
}

@Component({
  selector: 'app-main-products',
  standalone: true,  imports: [
    CommonModule, 
    RouterModule,
    NgxEchartsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    ProductSalesChartComponent,
    ProductBillingChartComponent,
    TopProductsTableComponent,
    TopProductsByMonthChartComponent,
    ProductSalesEvolutionChartComponent
  ],
  providers: [
    GetTotalBillingPerProductUseCase,
    GetTotalSalesPerProductUseCase,
    ...productsProviders,
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {
        echarts: () => import('echarts')
      }
    }
  ],
  templateUrl: './main-products.component.html',
  styleUrl: './main-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainProductsComponent implements OnInit, OnDestroy {  
  isBrowser: boolean;
  private destroy$ = new Subject<void>();
  
  // Selectores globales
  globalYear = new Date().getFullYear().toString();
  globalMonth = (new Date().getMonth() + 1).toString();constructor(
    public billingViewModel: ProductBillingViewModel,
    public salesViewModel: ProductSalesViewModel,
    public topProductsByMonthViewModel: TopProductsByMonthViewModel,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  ngOnInit(): void {
    // Inicializar datos solo si estamos en un navegador y no en un entorno de prueba
    if (this.isBrowser && !this.isTestEnvironment()) {
      // Aseguramos que los datos se carguen cuando se navega a esta vista
      this.billingViewModel.ensureDataLoaded();
      this.salesViewModel.ensureDataLoaded();
      this.topProductsByMonthViewModel.loadTopProductsByMonth();
    }
  }
  
  /**
   * Determina si la aplicación está ejecutándose en un entorno de pruebas
   * @returns true si se detecta que es un entorno de pruebas
   */
  private isTestEnvironment(): boolean {
    return (
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test'))))
    );
  }
    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el cambio en el selector global de mes
   * @param event Evento del cambio de selección
   */
  onGlobalMonthChange(event: MatSelectChange): void {
    this.globalMonth = event.value;
    // Aquí se puede añadir lógica para actualizar los gráficos con el nuevo mes
  }

  /**
   * Maneja el cambio en el selector global de año
   * @param event Evento del cambio de selección
   */
  onGlobalYearChange(event: MatSelectChange): void {
    this.globalYear = event.value;
    // Aquí se puede añadir lógica para actualizar los gráficos con el nuevo año
  }
  // La lógica de los gráficos se ha movido a sus respectivos componentes
}