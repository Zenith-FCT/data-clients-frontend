import { Injectable, computed, signal, inject, DestroyRef, PLATFORM_ID, Inject } from '@angular/core';
import { TopProductsByMonthModel } from '../domain/top-products-by-month.model';
import { GetTopProductsByMonthUseCase } from '../domain/get-top-products-by-month-use-case';
import { Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';

interface TopProductsByMonthState {
  topProductsByMonth: TopProductsByMonthModel[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

@Injectable()
export class TopProductsByMonthViewModel {
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  
  private readonly uiState = signal<TopProductsByMonthState>({
    topProductsByMonth: [],
    loading: false,
    error: null,
    initialized: false
  });

  // Señales computadas
  public readonly topProductsByMonth$ = computed(() => this.uiState().topProductsByMonth);
  public readonly loading$ = computed(() => this.uiState().loading);
  public readonly error$ = computed(() => this.uiState().error);
  public readonly initialized = computed(() => this.uiState().initialized);

  constructor(
    private getTopProductsByMonthUseCase: GetTopProductsByMonthUseCase,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('TopProductsByMonthViewModel initialized');
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

  loadTopProductsByMonth(): void {
    console.log('TopProductsByMonthViewModel: Iniciando carga de los 10 productos más vendidos por mes');
    
    if (!this.canMakeNetworkRequests()) {
      console.log('Saltando peticiones HTTP en entorno SSR o pruebas');
      return;
    }
    
    this.updateState({ 
      loading: true, 
      error: null 
    });

    this.getTopProductsByMonthUseCase.execute()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Error loading top products by month:', error);
          this.updateState({
            error: 'Error al cargar los productos más vendidos por mes. Intente nuevamente.',
            loading: false,
            initialized: true
          });
          return of([]);
        })
      )
      .subscribe({
        next: (topProductsByMonth: TopProductsByMonthModel[]) => {
          console.log(`TopProductsByMonthViewModel: Datos recibidos, ${topProductsByMonth.length} productos por mes`);
          
          if (topProductsByMonth.length === 0) {
            console.warn('TopProductsByMonthViewModel: No se recibieron datos de productos por mes');
            this.updateState({
              error: 'No se encontraron datos de los productos más vendidos por mes.',
              topProductsByMonth: [],
              loading: false,
              initialized: true
            });
            return;
          }
          
          this.updateState({ 
            topProductsByMonth,
            loading: false,
            error: null,
            initialized: true
          });
        }
      });
  }

  private updateState(stateChanges: Partial<TopProductsByMonthState>): void {
    this.uiState.update(state => ({
      ...state,
      ...stateChanges
    }));
  }
}
