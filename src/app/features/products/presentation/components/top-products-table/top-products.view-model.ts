import { Injectable, computed, signal, inject, DestroyRef, PLATFORM_ID, Inject } from '@angular/core';
import { TopProductModel } from '../../../domain/top-products.model';
import { GetTopProductsUseCase } from '../../../domain/get-top-products-use-case';
import { Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';

interface TopProductsState {
  topProducts: TopProductModel[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

@Injectable()
export class TopProductsViewModel {
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  
  private readonly uiState = signal<TopProductsState>({
    topProducts: [],
    loading: false,
    error: null,
    initialized: false
  });

  // Señales computadas
  public readonly topProducts$ = computed(() => this.uiState().topProducts);
  public readonly loading$ = computed(() => this.uiState().loading);
  public readonly error$ = computed(() => this.uiState().error);
  public readonly initialized = computed(() => this.uiState().initialized);

  constructor(
    private getTopProductsUseCase: GetTopProductsUseCase,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('TopProductsViewModel initialized');
  }

  private isTestEnvironment(): boolean {
    return (
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test'))))
    );
  }

  private canMakeNetworkRequests(): boolean {
    return isPlatformBrowser(this.platformId) && !this.isTestEnvironment();
  }

  loadTopProducts(): void {
    console.log('TopProductsViewModel: Iniciando carga de los 10 productos más vendidos');
    
    if (!this.canMakeNetworkRequests()) {
      console.log('Saltando peticiones HTTP en entorno SSR o pruebas');
      return;
    }
    
    this.updateState({ 
      loading: true, 
      error: null 
    });

    this.getTopProductsUseCase.execute()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Error loading top products:', error);
          this.updateState({
            error: 'Error al cargar los productos más vendidos. Intente nuevamente.',
            loading: false,
            initialized: true
          });
          return of([]);
        })
      )      .subscribe({
        next: (topProducts: TopProductModel[]) => {
          console.log(`TopProductsViewModel: Datos recibidos, ${topProducts.length} productos`);
          
          if (topProducts.length === 0) {
            console.warn('TopProductsViewModel: No se recibieron datos de productos');
            this.updateState({
              error: 'No se encontraron datos de los productos más vendidos.',
              topProducts: [],
              loading: false,
              initialized: true
            });
            return;
          }
          
          this.updateState({ 
            topProducts,
            loading: false,
            error: null,
            initialized: true
          });
        }
      });
  }

  private updateState(partialState: Partial<TopProductsState>): void {
    this.uiState.update((state) => ({
      ...state,
      ...partialState
    }));
  }

  public ensureDataLoaded(): void {
    if (!this.initialized() || this.topProducts$().length === 0) {
      this.loadTopProducts();
    } else {
      console.log('TopProductsViewModel: Los datos ya están cargados, no es necesario recargar');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
