import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { LtvDataRepository } from '../../data/data-repositories/ltv-repository.service';
import { LtvModel } from '../../domain/models/ltv.model';
import { GetMonthlyLtvUseCase } from '../../domain/use-cases/get-monthly-ltv.use-case';
import { state } from '@angular/animations';

export interface LtvUiState {
    ltv: LtvModel[];
    loading: boolean;
    error: string | null;
    selectedYear: number;
}
@Injectable({
    providedIn: 'root'
})
export class LtvViewModelService implements OnDestroy {

    private destroy$ = new Subject<void>();
    private readonly uiState = signal<LtvUiState>({
        ltv: [],
        loading: false,
        error: null,
        selectedYear: new Date().getFullYear()
    });
    public readonly loading$ = computed(() => this.uiState().loading);
    public readonly error$ = computed(() => this.uiState().error);
    public readonly ltv$ = computed(() => this.uiState().ltv);
    public readonly selectedYear$ = computed(() => this.uiState().selectedYear);
    private getMonthlyLtvUseCase: GetMonthlyLtvUseCase;
    constructor(private ltvDataRepository: LtvDataRepository) {
        this.getMonthlyLtvUseCase = new GetMonthlyLtvUseCase(this.ltvDataRepository);
    }
    public setSelectedYear(year: number): void {
        this.updateState({ selectedYear: year });
    }
    public async loadLtv(): Promise<void> {
        try {
            this.updateState({
                loading: true,
                error: null
            });
            const ltv = await firstValueFrom(this.getMonthlyLtvUseCase.execute());
            this.updateState({ 
                ltv,
                loading: false 
            });
        } catch (error) {
            this.updateState({ 
                error: error instanceof Error ? error.message : 'Error loading LTV data',
                loading: false
            });
        }
    }
    public async refreshData(): Promise<void> {
        await Promise.all([
            this.loadLtv()
        ]);
    }

    private updateState(partialState: Partial<LtvUiState>): void {
        this.uiState.update(state => ({
            ...state,
            ...partialState
        }));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}