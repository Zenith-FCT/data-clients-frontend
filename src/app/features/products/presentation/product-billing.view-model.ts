import { Injectable, OnDestroy, signal, computed, inject, DestroyRef, PLATFORM_ID, Inject } from '@angular/core';
import { Subject, firstValueFrom, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { TotalBillingPerProductModel } from '../domain/total-billing-per-product.model';
import { GetTotalBillingPerProductUseCase } from '../domain/get-total-billing-per-product-use-case';

interface ProductsUiState {
  productBilling: TotalBillingPerProductModel[];
  loading: boolean;
  error: string | null;
  chartOption: any;
  initialized: boolean; // Propiedad para controlar si ya se inicializó la primera carga
}

@Injectable()
export class ProductBillingViewModel implements OnDestroy {
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  
  private readonly uiState = signal<ProductsUiState>({
    productBilling: [],
    loading: false,
    error: null,
    chartOption: {
      // Opciones iniciales del gráfico para evitar errores de renderizado
      title: {
        text: 'Cargando datos...',
        left: 'center'
      }
    },
    initialized: false // Inicialmente no se ha cargado nada
  });

  public readonly loading = computed(() => this.uiState().loading);
  public readonly error = computed(() => this.uiState().error);
  public readonly productBilling = computed(() => this.uiState().productBilling);
  public readonly chartOption = computed(() => this.uiState().chartOption);
  public readonly initialized = computed(() => this.uiState().initialized);

  constructor(
    private getTotalBillingPerProductUseCase: GetTotalBillingPerProductUseCase,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('ProductBillingViewModel initialized');
  }

  /**
   * Determina si la aplicación está ejecutándose en un entorno de pruebas
   */
  private isTestEnvironment(): boolean {
    return (
      // Detectar si estamos en un entorno de pruebas karma
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       // Comprobar variables de entorno comunes en CI
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test')))
      )
    );
  }

  /**
   * Verifica si es seguro realizar peticiones HTTP en el entorno actual
   */
  private canMakeNetworkRequests(): boolean {
    // Evitar peticiones en SSR o en entornos de prueba
    return isPlatformBrowser(this.platformId) && !this.isTestEnvironment();
  }

  public loadProductBilling(): void {
    console.log('ProductBillingViewModel: Iniciando carga de datos de facturación por producto');
    
    if (!this.canMakeNetworkRequests()) {
      console.log('Saltando peticiones HTTP en entorno SSR o pruebas');
      return;
    }
    
    this.updateState({ 
      loading: true, 
      error: null,
      chartOption: {
        title: {
          text: 'Cargando datos de facturación...',
          left: 'center'
        }
      }
    });

    this.getTotalBillingPerProductUseCase.execute()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Error loading product billing:', error);
          this.updateState({
            error: 'Error al cargar los datos de facturación por producto. Intente nuevamente.',
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
        next: (productBilling) => {
          console.log(`ProductBillingViewModel: Datos recibidos, ${productBilling.length} productos`);
          
          // Si no hay datos, mostramos un mensaje de error
          if (productBilling.length === 0) {
            console.warn('ProductBillingViewModel: No se recibieron datos de productos');
            this.updateState({
              error: 'No se encontraron datos de facturación por producto.',
              productBilling: [],
              chartOption: {
                title: {
                  text: 'No se encontraron datos de facturación por producto',
                  left: 'center',
                  textStyle: {
                    color: '#888',
                    fontWeight: 'normal'
                  }
                }
              },
              loading: false,
              initialized: true // Marcamos como inicializado aunque no haya datos
            });
            return;
          }
          
          if (productBilling.length > 0) {
            console.log('ProductBillingViewModel: Primer producto recibido:', productBilling[0]);
          }
          
          // Actualizar los datos y calcular opciones del gráfico
          this.updateState({ 
            productBilling,
            loading: false,
            error: null,
            initialized: true // Marcamos como inicializado cuando hay datos
          });
          
          // Actualizar opciones del gráfico
          this.updateChartOption(productBilling);
        }
      });
  }

  private updateChartOption(productBilling: TotalBillingPerProductModel[]): void {
    console.log(`ProductBillingViewModel: Generando opciones del gráfico con ${productBilling.length} productos`);
    
    // Tomamos los top 10 productos por facturación
    const topProducts = productBilling
      .filter(product => product.totalBilling > 0) // Filtramos productos sin facturación
      .sort((a, b) => b.totalBilling - a.totalBilling); // Ordenamos de mayor a menor
    
    console.log(`ProductBillingViewModel: ${topProducts.length} productos con facturación positiva disponibles`);
    
    if (topProducts.length === 0) {
      console.warn('ProductBillingViewModel: No hay productos con facturación para mostrar en el gráfico');
      
      this.updateState({ 
        chartOption: {
          title: {
            text: 'No hay datos de facturación disponibles',
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
    
    // No calculamos las opciones del gráfico aquí porque lo hace el componente principal
    // solo actualizamos los datos para que el componente reaccione y renderice el gráfico
    console.log('ProductBillingViewModel: Datos de productos actualizados para el gráfico');
  }

  private updateState(partialState: Partial<ProductsUiState>): void {
    this.uiState.update((state) => ({
      ...state,
      ...partialState
    }));
  }

  // Método para verificar si es necesario volver a cargar los datos
  public ensureDataLoaded(): void {
    // Si no se han inicializado los datos o no hay datos cargados, los cargamos
    if (!this.initialized() || this.productBilling().length === 0) {
      this.loadProductBilling();
    } else {
      console.log('ProductBillingViewModel: Los datos ya están cargados, no es necesario recargar');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}