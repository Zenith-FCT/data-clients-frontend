import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { GetMonthlySalesUseCase } from '../../domain/use-cases/get-monthly-sales.use-cases';
import { GetAllMonthWithTotalsUseCase } from '../../domain/use-cases/get-all-month-with-totals.use-case';
import { MonthlySalesModel } from '../../domain/models/monthly-sales.model';
import { MonthlySalesDataRepository } from '../../data/data-repositories/monthly-sales-repository.service';
import { GetTotalAmountOrdersUseCase } from '../../domain/use-cases/get-total-amount-orders.use-case';
import { GetTotalOrdersUseCase } from '../../domain/use-cases/get-total-orders.use-case';

// Define UIState interface to consolidate all state properties
export interface MonthlySalesUIState {
  isLoading: boolean;
  error: string | null;
  monthlySales: number;
  allMonthlySales: MonthlySalesModel[];
  selectedYear: number;
  totalOrdersAmount: number;
  totalOrders: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonthlySalesViewModelService implements OnDestroy {
  private destroy$ = new Subject<void>();

  // Initialize UIState with default values
  private readonly uiState = signal<MonthlySalesUIState>({
    isLoading: false,
    error: null,
    monthlySales: 0,
    allMonthlySales: [],
    selectedYear: new Date().getFullYear(),
    totalOrdersAmount: 0,
    totalOrders: 0
  });

  public readonly uiState$ = this.uiState.asReadonly();

  public readonly isLoading$ = computed(() => this.uiState().isLoading);
  public readonly error$ = computed(() => this.uiState().error);
  public readonly monthlySales$ = computed(() => this.uiState().monthlySales);
  public readonly allMonthlySales$ = computed(() => this.uiState().allMonthlySales);
  public readonly selectedYear$ = computed(() => this.uiState().selectedYear);
  public readonly totalOrdersAmount$ = computed(() => this.uiState().totalOrdersAmount);
  public readonly totalOrders$ = computed(() => this.uiState().totalOrders);

  private getMonthlySalesUseCase: GetMonthlySalesUseCase;
  private getAllMonthWithTotalsUseCase: GetAllMonthWithTotalsUseCase;
  private getTotalAmountOrdersUseCase: GetTotalAmountOrdersUseCase;
  private getTotalOrdersUseCase: GetTotalOrdersUseCase;

  constructor(private monthlySalesRepository: MonthlySalesDataRepository) {
    this.getMonthlySalesUseCase = new GetMonthlySalesUseCase(this.monthlySalesRepository);
    this.getAllMonthWithTotalsUseCase = new GetAllMonthWithTotalsUseCase(this.monthlySalesRepository);
    this.getTotalAmountOrdersUseCase = new GetTotalAmountOrdersUseCase(this.monthlySalesRepository);
    this.getTotalOrdersUseCase = new GetTotalOrdersUseCase(this.monthlySalesRepository);
  }

  public setSelectedYear(year: number): void {
    this.updateState({ selectedYear: year });
  }

  public async loadMonthlySales(year: number, month: number): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null,
        selectedYear: year 
      });

      const total = await firstValueFrom(this.getMonthlySalesUseCase.execute(year, month));
      this.updateState({ monthlySales: total });
    } catch (error) {
      this.updateState({ 
        error: 'Error al cargar las ventas mensuales. Intente nuevamente.',
        monthlySales: 0 
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  public async loadAllMonthWithTotals(): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });

      const monthlyTotals = await firstValueFrom(this.getAllMonthWithTotalsUseCase.execute());
      this.updateState({ allMonthlySales: monthlyTotals });
      
      if (monthlyTotals.length > 0) {
        const years = monthlyTotals.map(sale => parseInt(sale.date.split('-')[0]));
        const mostRecentYear = Math.max(...years);
        this.updateState({ selectedYear: mostRecentYear });
      }
    } catch (error) {
      this.updateState({ 
        error: 'Error al cargar las ventas mensuales. Intente nuevamente.',
        allMonthlySales: [] 
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  public async loadTotalOrdersAmount(): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });
      
      const amount = await firstValueFrom(this.getTotalAmountOrdersUseCase.execute());
      this.updateState({ totalOrdersAmount: amount });
    } catch (error) {
      this.updateState({ 
        error: 'Error al cargar el total de pedidos. Intente nuevamente.',
        totalOrdersAmount: 0 
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  public async loadTotalOrders(): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });

      const total = await firstValueFrom(this.getTotalOrdersUseCase.execute());
      this.updateState({ totalOrders: total });
    } catch (error) {
      this.updateState({ 
        error: 'Error al cargar el total de pedidos. Intente nuevamente.',
        totalOrders: 0 
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  public async refreshData(forceRefresh: boolean = false): Promise<void> {
    const currentDate = new Date();
    await Promise.all([
      this.loadMonthlySales(this.selectedYear$(), currentDate.getMonth()),
      this.loadAllMonthWithTotals()
    ]);
  }

  private updateState(partialState: Partial<MonthlySalesUIState>): void {
    this.uiState.update(state => ({
      ...state,
      ...partialState
    }));
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}