import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { GetMonthlySalesUseCase } from '../../domain/use-cases/get-monthly-sales.use-cases';
import { GetAllMonthWithTotalsUseCase } from '../../domain/use-cases/get-all-month-with-totals.use-case';
import { MonthlySalesModel } from '../../domain/models/monthly-sales.model';
import { MonthlySalesDataRepository } from '../../data/data-repositories/monthly-sales-repository.service';
import { GetTotalAmountOrdersUseCase } from '../../domain/use-cases/get-total-amount-orders.use-case';
import { GetTotalOrdersUseCase } from '../../domain/use-cases/get-total-orders.use-case';
import { GetTotalMonthOrdersUseCase } from '../../domain/use-cases/get-total-month-orders.use-case';
import { GetAllMonthlyTMUseCase } from '../../domain/use-cases/get-all-monthly-tm.use-case';
import { TmModel } from '../../domain/use-cases/get-all-monthly-tm.use-case';
import { GetTmYearUseCase } from '../../domain/use-cases/get-tm-year.use-case';
import { GetMonthlyTmUseCase } from '../../domain/use-cases/get-monthly-tm.use-case';
import { GetTotalsForAllYearsUseCase } from '../../domain/use-cases/get-totals-for-all-years.use-case';

export interface OrdersInvoicesUIState {
  isLoading: boolean;
  error: string | null;
  monthlySales: number;
  allMonthlySales: MonthlySalesModel[];
  selectedYear: number;
  selectedMonth: number;
  totalOrdersAmount: number;
  totalOrders: number;
  monthlyOrders: number;
  monthlyTmList: TmModel[];
  totalTm: number;
  selectedTmYear: number;
  monthlyTm: number;
  totals: MonthlySalesModel;
  isShowingAllYears: boolean; // Indica si se ha seleccionado "Todos" en el selector de año
}

@Injectable({
  providedIn: 'root'
})
export class OrdersInvoiceViewModelService implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  private cachedValues: {
    [key: string]: {
      monthlySales?: number;
      monthlyOrders?: number;
      monthlyTm?: number;
    }
  } = {};
  
  private cachedAnnualValues: {
    [year: number]: {
      totalOrdersAmount: number;
      totalOrders: number;
      totalTm: number;
    }
  } = {};
    private readonly uiState = signal<OrdersInvoicesUIState>({
    isLoading: false,
    error: null,
    monthlySales: 0,
    allMonthlySales: [],
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    totalOrdersAmount: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    monthlyTmList: [],
    totalTm: 0,
    selectedTmYear: new Date().getFullYear(),
    monthlyTm: 0,
    totals: new MonthlySalesModel('', '', '', ''),
    isShowingAllYears: false
  });

  public readonly isLoading$ = computed(() => this.uiState().isLoading);
  public readonly error$ = computed(() => this.uiState().error);
  public readonly monthlySales$ = computed(() => this.uiState().monthlySales);
  public readonly allMonthlySales$ = computed(() => this.uiState().allMonthlySales);
  public readonly selectedYear$ = computed(() => this.uiState().selectedYear);
  public readonly selectedMonth$ = computed(() => this.uiState().selectedMonth);
  public readonly totalOrdersAmount$ = computed(() => this.uiState().totalOrdersAmount);
  public readonly totalOrders$ = computed(() => this.uiState().totalOrders);
  public readonly monthlyOrders$ = computed(() => this.uiState().monthlyOrders);
  public readonly monthlyTmList$ = computed(() => this.uiState().monthlyTmList);
  public readonly totalTm$ = computed(() => this.uiState().totalTm);
  public readonly selectedTmYear$ = computed(() => this.uiState().selectedTmYear);
  public readonly monthlyTm$ = computed(() => this.uiState().monthlyTm);
  public readonly totals$ = computed(() => this.uiState().totals);
  public readonly isShowingAllYears$ = computed(() => this.uiState().isShowingAllYears);

  private getMonthlySalesUseCase: GetMonthlySalesUseCase;
  private getAllMonthWithTotalsUseCase: GetAllMonthWithTotalsUseCase;
  private getTotalAmountOrdersUseCase: GetTotalAmountOrdersUseCase;
  private getTotalOrdersUseCase: GetTotalOrdersUseCase;  private getTotalMonthOrdersUseCase: GetTotalMonthOrdersUseCase;
  private getAllMonthlyTMUseCase: GetAllMonthlyTMUseCase;
  private getTmYearUseCase: GetTmYearUseCase;
  private getMonthlyTMUseCase: GetMonthlyTmUseCase;
  private getTotalsForAllYearsUseCase: GetTotalsForAllYearsUseCase;

  constructor(private monthlySalesRepository: MonthlySalesDataRepository) {
    this.getMonthlySalesUseCase = new GetMonthlySalesUseCase(this.monthlySalesRepository);
    this.getAllMonthWithTotalsUseCase = new GetAllMonthWithTotalsUseCase(this.monthlySalesRepository);
    this.getTotalAmountOrdersUseCase = new GetTotalAmountOrdersUseCase(this.monthlySalesRepository);
    this.getTotalOrdersUseCase = new GetTotalOrdersUseCase(this.monthlySalesRepository);
    this.getTotalMonthOrdersUseCase = new GetTotalMonthOrdersUseCase(this.monthlySalesRepository);
    this.getAllMonthlyTMUseCase = new GetAllMonthlyTMUseCase(this.monthlySalesRepository);
    this.getTmYearUseCase = new GetTmYearUseCase(this.monthlySalesRepository);
    this.getMonthlyTMUseCase = new GetMonthlyTmUseCase(this.monthlySalesRepository);
    this.getTotalsForAllYearsUseCase = new GetTotalsForAllYearsUseCase(this.monthlySalesRepository);
  }

  public setSelectedYear(year: number): void {
    if (year) {
      this.updateState({ selectedYear: year });
      
      const selectedMonth = this.uiState().selectedMonth;
      if (selectedMonth !== 0) {
        this.loadMonthlySales(year, selectedMonth);
        this.loadMonthlyOrders(year, selectedMonth);
        this.loadMonthlyTm(year, selectedMonth);
      }
    }
  }

  public setSelectedMonth(month: number): void {
    if (month) {
      this.updateState({ selectedMonth: month });
      const currentYear = this.uiState().selectedYear;
      this.loadMonthlySales(currentYear, month);
      this.loadMonthlyOrders(currentYear, month);
      this.loadMonthlyTm(currentYear, month);
    }
  }

  public updateSelectedMonth(month: number): void {
    this.updateState({ selectedMonth: month });
  }

  public resetMonthlyValues(): void {
    this.updateState({ 
      monthlySales: 0,
      monthlyOrders: 0,
      monthlyTm: 0,
      error: null
    });
  }

  public setIsShowingAllYears(isShowingAll: boolean): void {
    this.updateState({ isShowingAllYears: isShowingAll });
    
    if (isShowingAll) {
      this.loadTotalsForAllYears();
    }
  }

  public setSelectedTmYear(year: number): void {
    this.updateState({ selectedTmYear: year });
  }

  public async loadMonthlySales(year: number, month: number): Promise<void> {
    if (month === 0) {
      return;
    }

    const cacheKey = `${year}-${month}`;
    if (this.cachedValues[cacheKey]?.monthlySales !== undefined) {
      this.updateState({ monthlySales: this.cachedValues[cacheKey].monthlySales! });
      return;
    }
    
    try {
      this.updateState({ 
        isLoading: true, 
        error: null
      });

      const total = await firstValueFrom(this.getMonthlySalesUseCase.execute(year, month));
      this.cachedValues[cacheKey] = { ...this.cachedValues[cacheKey], monthlySales: total };
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
    if (month === 0) {
      return;
    }

    const cacheKey = `${year}-${month}`;
    if (this.cachedValues[cacheKey]?.monthlyOrders !== undefined) {
      this.updateState({ monthlyOrders: this.cachedValues[cacheKey].monthlyOrders! });
      return;
    }
    
    try {
      this.updateState({ 
        isLoading: true, 
        error: null
      });
      const total = await firstValueFrom(this.getTotalMonthOrdersUseCase.execute(year, month));
      this.cachedValues[cacheKey] = { ...this.cachedValues[cacheKey], monthlyOrders: total };
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
  
  public async loadMonthlyTm(year: number, month: number): Promise<void> {
    if (month === 0) {
      return;
    }

    if (!year) {
      this.updateState({
        error: 'Año requerido para cargar el ticket medio',
        monthlyTm: 0
      });
      return;
    }

    const cacheKey = `${year}-${month}`;
    if (this.cachedValues[cacheKey]?.monthlyTm !== undefined) {
      this.updateState({ monthlyTm: this.cachedValues[cacheKey].monthlyTm! });
      return;
    }

    try {
      this.updateState({ 
        isLoading: true, 
        error: null
      });

      const tm = await firstValueFrom(this.getMonthlyTMUseCase.execute(year, month));
      this.cachedValues[cacheKey] = { ...this.cachedValues[cacheKey], monthlyTm: tm };
      this.updateState({ 
        monthlyTm: tm,
        error: null
      });
    } catch (error) {
      console.error('Error loading monthly TM:', error);
      this.updateState({
        error: 'Error al cargar el ticket medio mensual. Intente nuevamente.',
        monthlyTm: 0
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
      
      const tmList = await firstValueFrom(this.getAllMonthlyTMUseCase.execute());
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
  public async loadYearTmList(year: number): Promise<void> {
    if (this.cachedAnnualValues[year]?.totalTm !== undefined) {
      this.updateState({ totalTm: this.cachedAnnualValues[year].totalTm });
      return;
    }

    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });
      
      const amountTm = await firstValueFrom(this.getTmYearUseCase.execute(year));
      this.cachedAnnualValues[year] = { ...this.cachedAnnualValues[year], totalTm: amountTm };
      this.updateState({ totalTm: amountTm });
    } catch (error) {
      this.updateState({ 
        error: 'Error al cargar el total de Ticket medio. Intente nuevamente.',
        totalTm: 0 
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
    if (this.cachedAnnualValues[year]?.totalOrdersAmount !== undefined) {
      this.updateState({ totalOrdersAmount: this.cachedAnnualValues[year].totalOrdersAmount });
      return;
    }

    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });
      
      const amount = await firstValueFrom(this.getTotalAmountOrdersUseCase.execute(year));
      this.cachedAnnualValues[year] = { ...this.cachedAnnualValues[year], totalOrdersAmount: amount };
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
    if (this.cachedAnnualValues[year]?.totalOrders !== undefined) {
      this.updateState({ totalOrders: this.cachedAnnualValues[year].totalOrders });
      return;
    }

    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });
      const total = await firstValueFrom(this.getTotalOrdersUseCase.execute(year));
      this.cachedAnnualValues[year] = { ...this.cachedAnnualValues[year], totalOrders: total };
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
  public async loadTotalsForAllYears(): Promise<void> {
    try {
      this.updateState({ 
        isLoading: true, 
        error: null 
      });
      
      const totals = await firstValueFrom(this.getTotalsForAllYearsUseCase.execute());
      this.updateState({ totals: totals });
    } catch (error) {
      this.updateState({ 
        error: 'Error al cargar los totales globales. Intente nuevamente.',
        totals: new MonthlySalesModel('total', 'total of years', '0', '0')
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }
  public async refreshData(forceRefresh: boolean = false): Promise<void> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; 
    
    await this.loadAllMonthWithTotals();
    
    await Promise.all([
      this.loadMonthlySales(this.selectedYear$(), currentMonth),
      this.loadMonthlyOrders(this.selectedYear$(), currentMonth),
      this.loadTotalOrdersAmount(this.selectedYear$()),
      this.loadTotalOrders(this.selectedYear$()),
      this.loadMonthlyTmList(),
      this.loadTotalsForAllYears()
    ]);
  }

  private updateState(partialState: Partial<OrdersInvoicesUIState>): void {
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