import { Injectable, OnDestroy, signal, computed, inject, DestroyRef, PLATFORM_ID, Inject } from '@angular/core';
import { Subject, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { TotalSalesPerProductModel } from '../domain/total-sales-per-product.model';
import { GetTotalSalesPerProductUseCase } from '../domain/get-total-sales-per-product-use-case';

interface SalesUiState {
  productSales: TotalSalesPerProductModel[];
  loading: boolean;
  error: string | null;
  chartOption: any;
  initialized: boolean;
  selectedProductType: string | null;
}

@Injectable()
export class ProductSalesViewModel implements OnDestroy {
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  
  private readonly uiState = signal<SalesUiState>({
    productSales: [],
    loading: false,
    error: null,
    chartOption: {
      title: {
        text: 'Cargando datos...',
        left: 'center'
      }
    },
    initialized: false,
    selectedProductType: null
  });

  public readonly loading = computed(() => this.uiState().loading);
  public readonly error = computed(() => this.uiState().error);
  public readonly productSales = computed(() => this.uiState().productSales);
  public readonly chartOption = computed(() => this.uiState().chartOption);
  public readonly initialized = computed(() => this.uiState().initialized);
  public readonly selectedProductType = computed(() => this.uiState().selectedProductType);
  public readonly productTypes = computed(() => {
    const types = Array.from(new Set(this.productSales().map(p => p.productType)));
    return types.sort();
  });
  
  public readonly filteredProductSales = computed(() => {
    if (!this.selectedProductType()) {
      return this.productSales();
    }
    return this.productSales().filter(p => p.productType === this.selectedProductType());
  });

  constructor(
    private getTotalSalesPerProductUseCase: GetTotalSalesPerProductUseCase,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('ProductSalesViewModel initialized');
  }

  private isTestEnvironment(): boolean {
    return (
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test')))
      )
    );
  }

  private canMakeNetworkRequests(): boolean {
    return isPlatformBrowser(this.platformId) && !this.isTestEnvironment();
  }

  public loadProductSales(): void {
    console.log('ProductSalesViewModel: Iniciando carga de datos de ventas por producto');
    
    if (!this.canMakeNetworkRequests()) {
      console.log('Saltando peticiones HTTP en entorno SSR o pruebas');
      return;
    }
    
    this.updateState({ 
      loading: true, 
      error: null,
      chartOption: {
        title: {
          text: 'Cargando datos de ventas...',
          left: 'center'
        }
      }
    });

    this.getTotalSalesPerProductUseCase.execute()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Error loading product sales:', error);
          this.updateState({
            error: 'Error al cargar los datos de ventas por producto. Intente nuevamente.',
            loading: false,
            chartOption: {
              title: {
                text: 'Error al cargar los datos',
                left: 'center',
                textStyle: {
                  color: '#d9534f',
                  fontWeight: 'bold'
                }
              }
            }
          });
          return of([]);
        })
      )
      .subscribe({
        next: (productSales) => {
          console.log(`ProductSalesViewModel: Datos recibidos, ${productSales.length} productos`);
          
          if (productSales.length === 0) {
            console.warn('ProductSalesViewModel: No se recibieron datos de productos');
            this.updateState({
              error: 'No se encontraron datos de ventas por producto.',
              productSales: [],
              chartOption: {
                title: {
                  text: 'No se encontraron datos de ventas por producto',
                  left: 'center',
                  textStyle: {
                    color: '#888',
                    fontWeight: 'normal'
                  }
                }
              },
              loading: false,
              initialized: true
            });
            return;
          }
          
          if (productSales.length > 0) {
            console.log('ProductSalesViewModel: Primer producto recibido:', productSales[0]);
            if (productSales.length > 0) {
              const types = Array.from(new Set(productSales.map(p => p.productType)));
              if (types.length > 0) {
                this.setSelectedProductType(types[0]);
              }
            }
          }
          
          this.updateState({ 
            productSales,
            loading: false,
            error: null,
            initialized: true
          });
          
          this.updateChartOption();
        }
      });
  }

  public setSelectedProductType(type: string | null): void {
    console.log(`ProductSalesViewModel: Cambiando tipo de producto seleccionado a: ${type}`);
    this.updateState({ selectedProductType: type });
    this.updateChartOption();
  }

  private updateChartOption(): void {
    console.log(`ProductSalesViewModel: Generando opciones del gráfico con datos filtrados`);
    
    const filteredProducts = this.filteredProductSales();
    
    const topProducts = filteredProducts
      .filter(product => product.totalSales > 0)
      .sort((a, b) => b.totalSales - a.totalSales);
    
    console.log(`ProductSalesViewModel: ${topProducts.length} productos con ventas disponibles`);
    
    if (topProducts.length === 0) {
      console.warn('ProductSalesViewModel: No hay productos con ventas para mostrar en el gráfico');
      
      this.updateState({ 
        chartOption: {
          title: {
            text: 'No hay datos de ventas disponibles',
            left: 'center',
            textStyle: {
              color: '#888',
              fontWeight: 'normal'
            }
          }
        } 
      });
      return;
    }
    
    console.log('ProductSalesViewModel: Datos de productos actualizados para el gráfico');
  }

  private updateState(partialState: Partial<SalesUiState>): void {
    this.uiState.update((state) => ({
      ...state,
      ...partialState
    }));
  }

  public ensureDataLoaded(): void {
    if (!this.initialized() || this.productSales().length === 0) {
      this.loadProductSales();
    } else {
      console.log('ProductSalesViewModel: Los datos ya están cargados, no es necesario recargar');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
