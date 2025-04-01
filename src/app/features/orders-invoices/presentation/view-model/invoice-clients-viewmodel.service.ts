import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { InvoiceClientsTypeDataRepository } from '../../data/data-repositories/invoice-client-type-repository.service';
import { InvoiceClientsTypeModel } from '../../domain/models/invoice-clients-type.model';
import { GetInvoiceClientsTypeUseCase } from '../../domain/use-cases/get-invoice-clients-type.use-case';

export interface InvoiceClientsUiState {
    invoiceClientsType: InvoiceClientsTypeModel[];
    loading: boolean;
    error: string | null;
    selectedYear: number;
}

@Injectable({
    providedIn: 'root'
})
export class InvoiceClientsViewModelService implements OnDestroy {
    private destroy$ = new Subject<void>();

    private readonly uiState = signal<InvoiceClientsUiState>({
        invoiceClientsType: [],
        loading: false,
        error: null,
        selectedYear: new Date().getFullYear()
    });

    public readonly loading$ = computed(() => this.uiState().loading);
    public readonly error$ = computed(() => this.uiState().error);
    public readonly invoiceClientsType$ = computed(() => this.uiState().invoiceClientsType);
    public readonly selectedYear$ = computed(() => this.uiState().selectedYear);

    private getInvoiceClientsTypeUseCase: GetInvoiceClientsTypeUseCase;

    constructor(private invoiceClientsTypeRepository: InvoiceClientsTypeDataRepository) {
        this.getInvoiceClientsTypeUseCase = new GetInvoiceClientsTypeUseCase(this.invoiceClientsTypeRepository);
    }

    public setSelectedYear(year: number): void {
        this.updateState({ selectedYear: year });
    }

    public async loadInvoiceClientsType(): Promise<void> {
        try {
            this.updateState({ 
                loading: true, 
                error: null 
            });

            const clientsTypeList = await firstValueFrom(this.getInvoiceClientsTypeUseCase.execute());
            this.updateState({ invoiceClientsType: clientsTypeList });
            
            if (clientsTypeList.length > 0) {
                const years = clientsTypeList.map(type => parseInt(type.date));
                const mostRecentYear = Math.max(...years);
                this.updateState({ selectedYear: mostRecentYear });
            }
        } catch (error) {
            console.error('Error loading invoice clients type:', error);
            this.updateState({
                error: 'Error al cargar los tipos de clientes de facturas. Intente nuevamente.',
                invoiceClientsType: []
            });
        } finally {
            this.updateState({ loading: false });
        }
    }

    public async refreshData(): Promise<void> {
        await this.loadInvoiceClientsType();
    }

    private updateState(partialState: Partial<InvoiceClientsUiState>): void {
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