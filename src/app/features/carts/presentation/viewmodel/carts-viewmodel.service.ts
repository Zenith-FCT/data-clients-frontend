import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetTotalLostCarsUseCase } from '../../domain/use-case/get-total-lost-cars.use-case';
import { GetAverageLostCarsUseCase } from '../../domain/use-case/get-average-lost-cars.use-case';
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

    constructor(private cartsDataRepository: CartsDataRepository) {
        this.loadAvailableYears();
    }

    async loadAvailableYears(): Promise<void> {
        try {
            const [carts, orders] = await Promise.all([
                firstValueFrom(this.cartsDataRepository.getCarts()),
                firstValueFrom(this.cartsDataRepository.getTotalOrders())
            ]);

            const yearsSet = new Set<number>();
            
            // Obtener años de carritos abandonados
            carts.forEach(cart => {
                const year = parseInt(cart.date.split('-')[0]);
                if (!isNaN(year)) {
                    yearsSet.add(year);
                }
            });
            
            // Obtener años de órdenes totales
            orders.forEach(order => {
                const year = parseInt(order.date.split('-')[0]);
                if (!isNaN(year)) {
                    yearsSet.add(year);
                }
            });

            // Convertir el Set a array y ordenar descendentemente
            const years = Array.from(yearsSet).sort((a, b) => b - a);
            
            this.updateState({ availableYears: years });
            
            // Si no hay año seleccionado, seleccionar el más reciente
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
    }
    setSelectedMonth(month: number): void {
        this.updateState({ selectedMonth: month });
    }

    async loadCarts(): Promise<void> {
        try {
            this.updateState({ loading: true, error: null });
            const useCase = new GetTotalLostCarsUseCase(this.cartsDataRepository);
            const carts = await firstValueFrom(useCase.execute());
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

            if (!selectedYear || !selectedMonth) {
                console.warn('No year or month selected');
                return;
            }

            this.updateState({ loading: true, error: null });
            const useCase = new GetAverageLostCarsUseCase(this.cartsDataRepository);
            const average = await firstValueFrom(useCase.executeWithDate(selectedYear, selectedMonth));
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