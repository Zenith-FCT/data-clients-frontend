import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetTotalLostCarsUseCase } from '../../domain/use-case/get-total-lost-cars.use-case';
import { GetAverageLostCarsUseCase } from '../../domain/use-case/get-average-lost-cars.use-case';
import { CartsDataRepository } from '../../data/data-repositories/carts-reposiroty.service';

interface CartsUiState {
    totalCarts: number;
    averageLostCarts: number;
    loading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class CartsViewModelService implements OnDestroy {
    private readonly uiState = signal<CartsUiState>({
        totalCarts: 0,
        averageLostCarts: 0,
        loading: false,
        error: null
    });

    readonly loading$ = computed(() => this.uiState().loading);
    readonly error$ = computed(() => this.uiState().error);
    readonly carts$ = computed(() => this.uiState().totalCarts);
    readonly averageLostCarts$ = computed(() => this.uiState().averageLostCarts);

    constructor(private cartsDataRepository: CartsDataRepository) {}

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
            this.updateState({ loading: true, error: null });
            const useCase = new GetAverageLostCarsUseCase(this.cartsDataRepository);
            const average = await firstValueFrom(useCase.execute());
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