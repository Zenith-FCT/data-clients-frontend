import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of, takeUntil, tap } from 'rxjs';
import { OrdersDataRepository } from '../../data/data-repositories/orders-repository.service';
import { GetMonthlySalesUseCase } from '../../domain/use-cases/get-monthly-sales.use-cases';
import { MonthlySalesDataRepository } from '../../data/data-repositories/monthly-sales-repository.service';
import { GetAllMonthWithTotalsUseCase } from '../../domain/use-cases/get-all-month-with-totals.use-case';
import { MonthlySalesModel } from '../../domain/models/monthly-sales.model';

@Injectable({
  providedIn: 'root'
})
export class MonthlySalesViewModelService implements OnDestroy {
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  private _monthlySales = new BehaviorSubject<number>(0);
  private _allMonthlySales = new BehaviorSubject<MonthlySalesModel[]>([]);
  private _selectedYear = new BehaviorSubject<number>(new Date().getFullYear());
  private destroy$ = new Subject<void>();

  public isLoading$: Observable<boolean> = this._isLoading.asObservable();
  public error$: Observable<string | null> = this._error.asObservable();
  public monthlySales$: Observable<number> = this._monthlySales.asObservable();
  public allMonthlySales$: Observable<MonthlySalesModel[]> = this._allMonthlySales.asObservable();
  public selectedYear$: Observable<number> = this._selectedYear.asObservable();

  private getMonthlySalesUseCase: GetMonthlySalesUseCase;
  private getAllMonthWithTotalsUseCase: GetAllMonthWithTotalsUseCase;
  constructor(
    private monthlySalesRepository: MonthlySalesDataRepository
  ) {
    this.getMonthlySalesUseCase = new GetMonthlySalesUseCase(this.monthlySalesRepository);
    this.getAllMonthWithTotalsUseCase = new GetAllMonthWithTotalsUseCase(this.monthlySalesRepository);
  }

  public setSelectedYear(year: number): void {
    this._selectedYear.next(year);
  }

  public loadMonthlySales(year: number, month: number): void {
    this._error.next(null);
    this._isLoading.next(true);
    this._selectedYear.next(year);

    this.getMonthlySalesUseCase.execute(year, month).pipe(
      tap((total: number) => {
        this._monthlySales.next(total);
      }),
      catchError(error => {
        this._error.next('Error al cargar las ventas mensuales. Intente nuevamente.');
        return of(0);
      }),
      takeUntil(this.destroy$),
      finalize(() => {
        this._isLoading.next(false);
      })
    ).subscribe();
  }
  public loadAllMonthWithTotals(): void {
    this._error.next(null);
    this._isLoading.next(true);

    this.getAllMonthWithTotalsUseCase.execute().pipe(
      tap((monthlyTotals: MonthlySalesModel[]) => {
        this._allMonthlySales.next(monthlyTotals);
        if (monthlyTotals.length > 0) {
          const years = monthlyTotals.map(sale => parseInt(sale.date.split('-')[0]));
          const mostRecentYear = Math.max(...years);
          this._selectedYear.next(mostRecentYear);
        }
      }),
      catchError(error => {
        this._error.next('Error al cargar las ventas mensuales. Intente nuevamente.');
        return of([]);
      }),
      takeUntil(this.destroy$),
      finalize(() => {
        this._isLoading.next(false);
      })
    ).subscribe();

  }

  public refreshData(forceRefresh: boolean = false): void {
    const currentDate = new Date();
    this.loadMonthlySales(this._selectedYear.value, currentDate.getMonth());
    this.loadAllMonthWithTotals();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}