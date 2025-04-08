import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetTotalLostCarsUseCase } from '../../domain/use-case/get-total-lost-cars.use-case';
import { GetAverageLostCarsUseCase } from '../../domain/use-case/get-average-lost-cars.use-case';
import { GetAvailableYearsUseCase } from '../../domain/use-case/get-available-years.use-case';
import { CartsDataRepository } from '../../data/data-repositories/carts-repository.service';

interface CartsUiState {
    totalCarts: number;
    averageLostCarts: number;
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
        // Reload data when year changes
        this.loadCarts();
        this.loadAverageLostCarts();
    }

    setSelectedMonth(month: number): void {
        this.updateState({ selectedMonth: month });
        this.loadAverageLostCarts();
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
            const selectedMonth = this.uiState().selectedMonth;

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

    private updateState(partialState: Partial<CartsUiState>): void {
        this.uiState.update(state => ({ ...state, ...partialState }));
    }

    ngOnDestroy(): void {}
}