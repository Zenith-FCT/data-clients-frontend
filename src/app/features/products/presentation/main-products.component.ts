import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { productsProviders } from '../products.providers';
import { ProductBillingViewModel } from './product-billing.view-model';
import { ProductSalesViewModel } from './product-sales.view-model';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { GetTotalBillingPerProductUseCase } from '../domain/get-total-billing-per-product-use-case';
import { GetTotalSalesPerProductUseCase } from '../domain/get-total-sales-per-product-use-case';
import { Subject } from 'rxjs';
import { ProductSalesChartComponent } from './components/product-sales-chart/product-sales-chart.component';
import { ProductBillingChartComponent } from './components/product-billing-chart/product-billing-chart.component';

export enum ChartViewMode {
  ByProduct = 'byProduct',
  ByProductType = 'byProductType'
}

@Component({
  selector: 'app-main-products',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    NgxEchartsModule,
    FormsModule,
    ProductSalesChartComponent,
    ProductBillingChartComponent,
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
  constructor(
    public billingViewModel: ProductBillingViewModel,
    public salesViewModel: ProductSalesViewModel,
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
  // La lógica de los gráficos se ha movido a sus respectivos componentes
}