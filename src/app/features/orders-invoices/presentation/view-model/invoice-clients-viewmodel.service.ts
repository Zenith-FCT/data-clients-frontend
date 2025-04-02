import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { InvoiceClientsTypeDataRepository } from '../../data/data-repositories/invoice-client-type-repository.service';
import { InvoiceClientsTypeModel } from '../../domain/models/invoice-clients-type.model';
import { GetInvoiceClientsTypeUseCase } from '../../domain/use-cases/get-invoice-clients-type.use-case';
import { GetOrdersClientsTypeUseCase } from '../../domain/use-cases/get-orders-client-type.use-case';
import { GetOrdersByClientsMonthlyUseCase } from '../../domain/use-cases/get-orders-by-clients-monthly.use-case';

export interface InvoiceClientsUiState {
    invoiceClientsType: InvoiceClientsTypeModel[];
    ordersClientsType: InvoiceClientsTypeModel[];
    ordersByClientsMonthly: InvoiceClientsTypeModel[];
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
        ordersClientsType: [],
        ordersByClientsMonthly: [],
        loading: false,
        error: null,
        selectedYear: new Date().getFullYear()
    });

    public readonly loading$ = computed(() => this.uiState().loading);
    public readonly error$ = computed(() => this.uiState().error);
    public readonly invoiceClientsType$ = computed(() => this.uiState().invoiceClientsType);
    public readonly ordersClientsType$ = computed(() => this.uiState().ordersClientsType);
    public readonly ordersByClientsMonthly$ = computed(() => this.uiState().ordersByClientsMonthly);
    public readonly selectedYear$ = computed(() => this.uiState().selectedYear);

    private getInvoiceClientsTypeUseCase: GetInvoiceClientsTypeUseCase;
    private getOrdersClientsTypeUseCase: GetOrdersClientsTypeUseCase;
    private getOrdersByClientsMonthlyUseCase: GetOrdersByClientsMonthlyUseCase;

    constructor(private invoiceClientsTypeRepository: InvoiceClientsTypeDataRepository) {
        this.getInvoiceClientsTypeUseCase = new GetInvoiceClientsTypeUseCase(this.invoiceClientsTypeRepository);
        this.getOrdersClientsTypeUseCase = new GetOrdersClientsTypeUseCase(this.invoiceClientsTypeRepository);
        this.getOrdersByClientsMonthlyUseCase = new GetOrdersByClientsMonthlyUseCase(this.invoiceClientsTypeRepository);
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
    
    public async loadOrdersClientsType(): Promise<void> {
        try {
            this.updateState({ 
                loading: true, 
                error: null 
            });

            const clientsTypeList = await firstValueFrom(this.getOrdersClientsTypeUseCase.execute());
            this.updateState({ ordersClientsType: clientsTypeList });
            
            if (clientsTypeList.length > 0) {
                const years = clientsTypeList.map(type => parseInt(type.date));
                const mostRecentYear = Math.max(...years);
                this.updateState({ selectedYear: mostRecentYear });
            }
        } catch (error) {
            console.error('Error loading orders clients type:', error);
            this.updateState({
                error: 'Error al cargar los tipos de clientes de pedidos. Intente nuevamente.',
                ordersClientsType: []
            });
        } finally {
            this.updateState({ loading: false });
        }
    }

    public async loadOrdersByClientsMonthly(): Promise<void> {
        try {
            this.updateState({ 
                loading: true, 
                error: null 
            });

            const clientsTypeList = await firstValueFrom(this.getOrdersByClientsMonthlyUseCase.execute());
            this.updateState({ ordersByClientsMonthly: clientsTypeList });
            
            if (clientsTypeList.length > 0) {
                const years = clientsTypeList.map(type => parseInt(type.date));
                const mostRecentYear = Math.max(...years);
                this.updateState({ selectedYear: mostRecentYear });
            }
        } catch (error) {
            console.error('Error loading monthly orders by clients:', error);
            this.updateState({
                error: 'Error al cargar los pedidos mensuales por clientes. Intente nuevamente.',
                ordersByClientsMonthly: []
            });
        } finally {
            this.updateState({ loading: false });
        }
    }

    public async refreshData(): Promise<void> {
        await Promise.all([
            this.loadInvoiceClientsType(),
            this.loadOrdersClientsType(),
            this.loadOrdersByClientsMonthly()
        ]);
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