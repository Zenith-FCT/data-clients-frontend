import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { GetMonthlySalesUseCase } from '../../domain/use-cases/get-monthly-sales.use-cases';
import { GetAllMonthWithTotalsUseCase } from '../../domain/use-cases/get-all-month-with-totals.use-case';
import { MonthlySalesModel } from '../../domain/models/monthly-sales.model';
import { MonthlySalesDataRepository } from '../../data/data-repositories/monthly-sales-repository.service';
import { GetTotalAmountOrdersUseCase } from '../../domain/use-cases/get-total-amount-orders.use-case';
import { GetTotalOrdersUseCase } from '../../domain/use-cases/get-total-orders.use-case';
import { GetTotalMonthOrdersUseCase } from '../../domain/use-cases/get-total-month-orders.use-case';
import { GetMonthlyTMUseCase } from '../../domain/use-cases/get-monthly-tm.use-case';
import { TmModel } from '../../domain/use-cases/get-monthly-tm.use-case';

export interface MonthlySalesUIState {
  isLoading: boolean;
  error: string | null;
  monthlySales: number;
  allMonthlySales: MonthlySalesModel[];
  selectedYear: number;
  selectedOrderYear: number;
  totalOrdersAmount: number;
  totalOrders: number;
  monthlyOrders: number;
  monthlyTmList: TmModel[];
}

@Injectable({
  providedIn: 'root'
})
export class MonthlySalesViewModelService implements OnDestroy {
  private destroy$ = new Subject<void>();

  private readonly uiState = signal<MonthlySalesUIState>({
    isLoading: false,
    error: null,
    monthlySales: 0,
    allMonthlySales: [],
    selectedYear: new Date().getFullYear(),
    selectedOrderYear: new Date().getFullYear(),
    totalOrdersAmount: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    monthlyTmList: []
  });

  public readonly uiState$ = this.uiState.asReadonly();

  public readonly isLoading$ = computed(() => this.uiState().isLoading);
  public readonly error$ = computed(() => this.uiState().error);
  public readonly monthlySales$ = computed(() => this.uiState().monthlySales);
  public readonly allMonthlySales$ = computed(() => this.uiState().allMonthlySales);
  public readonly selectedYear$ = computed(() => this.uiState().selectedYear);
  public readonly selectedOrderYear$ = computed(() => this.uiState().selectedOrderYear);
  public readonly totalOrdersAmount$ = computed(() => this.uiState().totalOrdersAmount);
  public readonly totalOrders$ = computed(() => this.uiState().totalOrders);
  public readonly monthlyOrders$ = computed(() => this.uiState().monthlyOrders);
  public readonly monthlyTmList$ = computed(() => this.uiState().monthlyTmList);

  private getMonthlySalesUseCase: GetMonthlySalesUseCase;
  private getAllMonthWithTotalsUseCase: GetAllMonthWithTotalsUseCase;
  private getTotalAmountOrdersUseCase: GetTotalAmountOrdersUseCase;
  private getTotalOrdersUseCase: GetTotalOrdersUseCase;
  private getTotalMonthOrdersUseCase: GetTotalMonthOrdersUseCase;
  private getMonthlyTMUseCase: GetMonthlyTMUseCase;

  constructor(private monthlySalesRepository: MonthlySalesDataRepository) {
    this.getMonthlySalesUseCase = new GetMonthlySalesUseCase(this.monthlySalesRepository);
    this.getAllMonthWithTotalsUseCase = new GetAllMonthWithTotalsUseCase(this.monthlySalesRepository);
    this.getTotalAmountOrdersUseCase = new GetTotalAmountOrdersUseCase(this.monthlySalesRepository);
    this.getTotalOrdersUseCase = new GetTotalOrdersUseCase(this.monthlySalesRepository);
    this.getTotalMonthOrdersUseCase = new GetTotalMonthOrdersUseCase(this.monthlySalesRepository);
    this.getMonthlyTMUseCase = new GetMonthlyTMUseCase(this.monthlySalesRepository);
  }

  public setSelectedYear(year: number): void {
    this.updateState({ selectedYear: year });
  }

  public setSelectedOrderYear(year: number): void {
    this.updateState({ selectedOrderYear: year });
  }

  public async loadMonthlySales(year: number, month: number): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null
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

  public async loadMonthlyOrders(year: number, month: number): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null
      });
      const total = await firstValueFrom(this.getTotalMonthOrdersUseCase.execute(year, month));
      this.updateState({ monthlyOrders: total });
    } catch (error) {
      this.updateState({
        error: 'Error al cargar las órdenes mensuales. Intente nuevamente.',
        monthlyOrders: 0
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  public async loadMonthlyTmList(): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null
      });
      
      const tmList = await firstValueFrom(this.getMonthlyTMUseCase.execute());
      this.updateState({ monthlyTmList: tmList });
    } catch (error) {
      this.updateState({
        error: 'Error al cargar el ticket medio mensual. Intente nuevamente.',
        monthlyTmList: []
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
        this.updateState({ 
          selectedYear: mostRecentYear,
          selectedOrderYear: mostRecentYear
        });
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

  public async loadTotalOrdersAmount(year: number): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });
      
      const amount = await firstValueFrom(this.getTotalAmountOrdersUseCase.execute(year));
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
  
  public async loadTotalOrders(year: number): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });
      const total = await firstValueFrom(this.getTotalOrdersUseCase.execute(year));
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
    const currentMonth = currentDate.getMonth();
    
    await this.loadAllMonthWithTotals();
    
    await Promise.all([
      this.loadMonthlySales(this.selectedYear$(), currentMonth),
      this.loadMonthlyOrders(this.selectedOrderYear$(), currentMonth),
      this.loadTotalOrdersAmount(this.selectedYear$()),
      this.loadTotalOrders(this.selectedYear$()),
      this.loadMonthlyTmList()
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