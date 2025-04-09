import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetTotalLostCarsUseCase } from '../../domain/use-case/get-total-lost-cars.use-case';
import { GetRateLostCarsUseCase } from '../../domain/use-case/get-rate-lost-cars.use-case';
import { GetAvailableYearsUseCase } from '../../domain/use-case/get-available-years.use-case';
import { CartsDataRepository } from '../../data/data-repositories/carts-repository.service';
import { GetTotalLostCartsMonthlyUseCase } from '../../domain/use-case/get-total-lost-cars-monthly.use-case';
import { GetRateLostCartsMonthlyUseCase } from '../../domain/use-case/get-rate-lost-cars-monthly.use-case';
import { GetCartsListUseCase } from '../../domain/use-case/get-carts-list.use-case';
import { CartModel, CartsAbandonedRate } from '../../domain/models/carts.model';
import { GetRateAbandonedCartsListUseCase } from '../../domain/use-case/get-rate-abandoned-carts-list.use-case';

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
    filteredRateAbandonedCarts: CartsAbandonedRate[];
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
        filteredCartsModelList: [],
        filteredRateAbandonedCarts: []
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

    private getTotalLostCarsUseCase: GetTotalLostCarsUseCase;
    private getRateLostCarsUseCase: GetRateLostCarsUseCase;
    private getAvailableYearsUseCase: GetAvailableYearsUseCase;
    private getTotalLostCartsMonthlyUseCase: GetTotalLostCartsMonthlyUseCase;
    private getRateLostCartsMonthlyUseCase: GetRateLostCartsMonthlyUseCase;
    private getCartsListUseCase: GetCartsListUseCase;
    private getRateAbandonedCartsListUseCase: GetRateAbandonedCartsListUseCase;

    constructor(private cartsDataRepository: CartsDataRepository) {
        this.getTotalLostCarsUseCase = new GetTotalLostCarsUseCase(this.cartsDataRepository);
        this.getRateLostCarsUseCase = new GetRateLostCarsUseCase(this.cartsDataRepository);
        this.getAvailableYearsUseCase = new GetAvailableYearsUseCase(this.cartsDataRepository);
        this.getTotalLostCartsMonthlyUseCase = new GetTotalLostCartsMonthlyUseCase(this.cartsDataRepository);
        this.getRateLostCartsMonthlyUseCase = new GetRateLostCartsMonthlyUseCase(this.cartsDataRepository);
        this.getCartsListUseCase = new GetCartsListUseCase(this.cartsDataRepository);
        this.getRateAbandonedCartsListUseCase = new GetRateAbandonedCartsListUseCase(this.cartsDataRepository);
        
        this.loadAvailableYears();
    }    async loadAvailableYears(): Promise<void> {
        try {
            const years = await firstValueFrom(this.getAvailableYearsUseCase.execute());
            
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
    }    async loadCarts(): Promise<void> {
        try {
            const selectedYear = this.uiState().selectedYear;
            
            if (!selectedYear) {
                console.warn('No year selected');
                return;
            }
            
            this.updateState({ loading: true, error: null });
            const carts = await firstValueFrom(this.getTotalLostCarsUseCase.execute(selectedYear));
            this.updateState({ totalCarts: carts, loading: false });
        } catch (error) {
            this.updateState({ 
                error: error instanceof Error ? error.message : 'Error loading carts data',
                loading: false
            });
        }
    }    async loadAverageLostCarts(): Promise<void> {
        try {
            const selectedYear = this.uiState().selectedYear;

            if (!selectedYear) {
                console.warn('No year selected');
                return;
            }

            this.updateState({ loading: true, error: null });
            const average = await firstValueFrom(this.getRateLostCarsUseCase.execute(selectedYear));
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

            const cartsList = await firstValueFrom(this.getCartsListUseCase.execute());

            const filtered = cartsList.filter(cart => {
                if (!cart.date) return false;
                const cartYear = cart.date.split('-')[0];
                return parseInt(cartYear) === selectedYear;
            });

            this.updateState({ 
                filteredCartsModelList: filtered,
                loading: false 
            });

            const total = await firstValueFrom(this.getTotalLostCartsMonthlyUseCase.execute(selectedYear, selectedMonth));
            
            const average = await firstValueFrom(this.getRateLostCartsMonthlyUseCase.execute(selectedYear, selectedMonth));
            
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
    }    async loadCartsModelList(): Promise<void> {
        try {
            this.updateState({ loading: true, error: null });
            const cartsList = await firstValueFrom(this.getCartsListUseCase.execute());
            
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
    }    async loadAbandonedRateCarts(): Promise<void> {
        try {
            const selectedYear = this.uiState().selectedYear;
            
            if (!selectedYear) {
                console.warn('No year selected');
                return;
            }
            
            this.updateState({ loading: true, error: null });
            
            let cartsResult: CartsAbandonedRate[] = [];
            
            try {
                const result = await firstValueFrom(this.getRateAbandonedCartsListUseCase.execute());
                if (Array.isArray(result)) {
                    cartsResult = result;
                }
            } catch (err) {
                console.error('Error executing use case:', err);
                cartsResult = [];
            }
            
            const filteredCarts = cartsResult.filter((cart: CartsAbandonedRate) => {
                if (!cart || !cart.date) return false;
                try {
                    const dateObj = new Date(cart.date);
                    if (isNaN(dateObj.getTime())) return false;
                    const cartYear = dateObj.getFullYear();
                    return cartYear === selectedYear;
                } catch {
                    return false;
                }
            });

            this.updateState({
                filteredRateAbandonedCarts: filteredCarts,
                loading: false
            });

        } catch (error) {
            this.updateState({ 
                error: error instanceof Error ? error.message : 'Error loading abandoned rate carts',
                loading: false,
                filteredRateAbandonedCarts: []
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