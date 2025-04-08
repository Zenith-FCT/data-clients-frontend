import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetTotalLostCarsUseCase } from '../../domain/use-case/get-total-lost-cars.use-case';
import { GetAverageLostCarsUseCase } from '../../domain/use-case/get-average-lost-cars.use-case';
import { GetAvailableYearsUseCase } from '../../domain/use-case/get-available-years.use-case';
import { CartsDataRepository } from '../../data/data-repositories/carts-repository.service';
import { GetTotalLostCartsMonthlyUseCase } from '../../domain/use-case/get-total-lost-cars-monthly.use-case';
import { GetAverageLostCartsMonthlyUseCase } from '../../domain/use-case/get-average-lost-cars-monthly.use-case';
import { GetCartsModelListUseCase } from '../../domain/use-case/get-carts-model-list.use-case';
import { CartModel } from '../../domain/models/carts.model';

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
    cartsModelList: CartModel[];
    filteredCartsModelList: CartModel[];
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
        selectedYear: new Date().getFullYear(),
        selectedMonth: new Date().getMonth() + 1,
        availableYears: [],
        cartsModelList: [],
        filteredCartsModelList: []
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
    readonly cartsModelList$ = computed(() => this.uiState().cartsModelList);
    readonly filteredCartsModelList$ = computed(() => this.uiState().filteredCartsModelList);

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
        this.filterAndUpdateCarts();
        this.loadMonthlyAbandonedCarts();
        this.loadCarts();
        this.loadAverageLostCarts();
    }

    setSelectedMonth(month: number): void {
        this.updateState({ selectedMonth: month });
        this.loadMonthlyAbandonedCarts();
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

    async loadMonthlyAbandonedCarts(): Promise<void> {
        try {
            const selectedYear = this.uiState().selectedYear;
            const selectedMonth = this.uiState().selectedMonth;

            if (!selectedYear || !selectedMonth) {
                console.warn('No year or month selected');
                return;
            }

            this.updateState({ loading: true, error: null });

            const useCase = new GetCartsModelListUseCase(this.cartsDataRepository);
            const cartsList = await firstValueFrom(useCase.execute());

            const filtered = cartsList.filter(cart => {
                if (!cart.date) return false;
                const cartYear = cart.date.split('-')[0];
                return parseInt(cartYear) === selectedYear;
            });

            this.updateState({ 
                filteredCartsModelList: filtered,
                loading: false 
            });

            const totalUseCase = new GetTotalLostCartsMonthlyUseCase(this.cartsDataRepository);
            const total = await firstValueFrom(totalUseCase.execute(selectedYear, selectedMonth));
            
            const averageUseCase = new GetAverageLostCartsMonthlyUseCase(this.cartsDataRepository);
            const average = await firstValueFrom(averageUseCase.execute(selectedYear, selectedMonth));
            
            this.updateState({
                totalCartsMonthly: total,
                averageCartsMonthly: average
            });
            
        } catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Error loading monthly statistics',
                loading: false,
                totalCartsMonthly: 0,
                averageCartsMonthly: 0
            });
        }
    }

    async loadCartsModelList(): Promise<void> {
        try {
            this.updateState({ loading: true, error: null });
            const useCase = new GetCartsModelListUseCase(this.cartsDataRepository);
            const cartsList = await firstValueFrom(useCase.execute());
            
            this.updateState({ 
                cartsModelList: cartsList,
                loading: false 
            });

            await this.filterAndUpdateCarts();
        } catch (error) {
            console.error('Error loading carts:', error);
            this.updateState({ 
                error: error instanceof Error ? error.message : 'Error loading carts model list',
                loading: false,
                cartsModelList: [],
                filteredCartsModelList: []
            });
        }
    }

    private async filterAndUpdateCarts(): Promise<void> {
        const selectedYear = this.uiState().selectedYear;
        const cartsList = this.uiState().cartsModelList;
        
        if (!selectedYear || !cartsList.length) {
            this.updateState({ filteredCartsModelList: [] });
            return;
        }
        
        const filtered = cartsList.filter(cart => {
            if (!cart.date) return false;
            const [year] = cart.date.split('-').map(Number);
            return year === selectedYear;
        });
        
        this.updateState({ 
            filteredCartsModelList: filtered,
            error: null
        });
    }

    filterCartsBySelectedYear(): void {
        const selectedYear = this.uiState().selectedYear;
        const cartsList = this.uiState().cartsModelList;
        
        if (!selectedYear || !cartsList.length) {
            this.updateState({ filteredCartsModelList: [] });
            return;
        }
        
        const filtered = cartsList.filter(cart => {
            if (!cart.date) return false;
            
            const cartYear = new Date(cart.date).getFullYear();
            return cartYear === selectedYear;
        });
        
        this.updateState({ filteredCartsModelList: filtered });
    }

    private updateState(partialState: Partial<CartsUiState>): void {
        this.uiState.update(state => ({ ...state, ...partialState }));
    }

    ngOnDestroy(): void {}
}