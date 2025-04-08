import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetTotalLostCarsUseCase } from '../../domain/use-case/get-total-lost-cars.use-case';
import { GetAverageLostCarsUseCase } from '../../domain/use-case/get-average-lost-cars.use-case';
import { GetAvailableYearsUseCase } from '../../domain/use-case/get-available-years.use-case';
import { CartsDataRepository } from '../../data/data-repositories/carts-repository.service';
import { GetTotalLostCartsMonthlyUseCase } from '../../domain/use-case/get-total-lost-cars-monthly.use-case';
import { GetAverageLostCartsMonthlyUseCase } from '../../domain/use-case/get-average-lost-cars-monthly.use-case';

interface CartsUiState {
    totalCarts: number;
    averageLostCarts: number;
    totalCartsMonthly: number;
    averageCartsMonthly: number;
    loading: boolean;
    error: string | null;
    selectedYear: number | null;
    selectedMonth: number | null;
    availableYears: number[];
}

@Injectable({
    providedIn: 'root'
})
export class CartsViewModelService implements OnDestroy {
    private readonly uiState = signal<CartsUiState>({
        totalCarts: 0,
        averageLostCarts: 0,
        totalCartsMonthly: 0,
        averageCartsMonthly: 0,
        loading: false,
        error: null,
        selectedYear: null,
        selectedMonth: null,
        availableYears: []
    });

    readonly loading$ = computed(() => this.uiState().loading);
    readonly error$ = computed(() => this.uiState().error);
    readonly carts$ = computed(() => this.uiState().totalCarts);
    readonly averageLostCarts$ = computed(() => this.uiState().averageLostCarts);
    readonly totalCartsMonthly$ = computed(() => this.uiState().totalCartsMonthly);
    readonly averageCartsMonthly$ = computed(() => this.uiState().averageCartsMonthly);
    readonly availableYears$ = computed(() => this.uiState().availableYears);
    readonly selectedYear$ = computed(() => this.uiState().selectedYear);
    readonly selectedMonth$ = computed(() => this.uiState().selectedMonth);

    constructor(private cartsDataRepository: CartsDataRepository) {
        this.loadAvailableYears();
    }

    async loadAvailableYears(): Promise<void> {
        try {
            const useCase = new GetAvailableYearsUseCase(this.cartsDataRepository);
            const years = await firstValueFrom(useCase.execute());
            
            this.updateState({ availableYears: years });
            
            if (!this.uiState().selectedYear && years.length > 0) {
                this.setSelectedYear(years[0]);
            }
        } catch (error) {
            console.error('Error loading available years:', error);
            this.updateState({ 
                error: error instanceof Error ? error.message : 'Error loading available years',
                availableYears: []
            });
        }
    }

    setSelectedYear(year: number): void {
        this.updateState({ selectedYear: year });
        this.loadCarts();
        this.loadAverageLostCarts();
        this.loadMonthlyStatistics();
    }

    setSelectedMonth(month: number): void {
        this.updateState({ selectedMonth: month });
        this.loadMonthlyStatistics();
    }

    async loadCarts(): Promise<void> {
        try {
            const selectedYear = this.uiState().selectedYear;
            
            if (!selectedYear) {
                console.warn('No year selected');
                return;
            }
            
            this.updateState({ loading: true, error: null });
            const useCase = new GetTotalLostCarsUseCase(this.cartsDataRepository);
            const carts = await firstValueFrom(useCase.execute(selectedYear));
            this.updateState({ totalCarts: carts, loading: false });
        } catch (error) {
            this.updateState({ 
                error: error instanceof Error ? error.message : 'Error loading carts data',
                loading: false
            });
        }
    }

    async loadAverageLostCarts(): Promise<void> {
        try {
            const selectedYear = this.uiState().selectedYear;

            if (!selectedYear) {
                console.warn('No year selected');
                return;
            }

            this.updateState({ loading: true, error: null });
            const useCase = new GetAverageLostCarsUseCase(this.cartsDataRepository);
            const average = await firstValueFrom(useCase.execute(selectedYear));
            this.updateState({ averageLostCarts: average, loading: false });
        } catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Error loading average lost carts data',
                loading: false
            });
        }
    }

    async loadMonthlyStatistics(): Promise<void> {
        try {
            const selectedYear = this.uiState().selectedYear;
            const selectedMonth = this.uiState().selectedMonth;

            if (!selectedYear || !selectedMonth) {
                console.warn('Year or month not selected');
                return;
            }

            this.updateState({ loading: true, error: null });

            // Load both monthly statistics in parallel
            const [totalMonthly, averageMonthly] = await Promise.all([
                firstValueFrom(new GetTotalLostCartsMonthlyUseCase(this.cartsDataRepository).execute(selectedYear, selectedMonth)),
                firstValueFrom(new GetAverageLostCartsMonthlyUseCase(this.cartsDataRepository).execute(selectedYear, selectedMonth))
            ]);

            this.updateState({ 
                totalCartsMonthly: totalMonthly,
                averageCartsMonthly: averageMonthly,
                loading: false 
            });
        } catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Error loading monthly statistics',
                loading: false
            });
        }
    }

    private updateState(partialState: Partial<CartsUiState>): void {
        this.uiState.update(state => ({ ...state, ...partialState }));
    }

    ngOnDestroy(): void {}
}