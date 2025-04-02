import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { GetOrderInvoiceProductTypeUseCase } from '../../domain/use-cases/get-Invoice-product-type.use-case';
import { OrderInvoiceProductTypeModel } from '../../domain/models/order-invoice-product-type.model';
import { OrderInvoiceProductTypeDataRepository } from '../../data/data-repositories/order-invoice-product-type-repository.service';

export interface OrderInvoiceProductUiState {
    InvoiceProductType: OrderInvoiceProductTypeModel[];
    ordersProductType: OrderInvoiceProductTypeModel[];
    loading: boolean;
    error: string | null;
}
@Injectable({
    providedIn: 'root'
})
export class OrderInvoiceProductViewModelService implements OnDestroy {
    private destroy$ = new Subject<void>();

    private readonly uiState = signal<OrderInvoiceProductUiState>({
        InvoiceProductType: [],
        ordersProductType: [],
        loading: false,
        error: null
    });

    public readonly loading$ = computed(() => this.uiState().loading);
    public readonly error$ = computed(() => this.uiState().error);
    public readonly InvoiceProductType$ = computed(() => this.uiState().InvoiceProductType);
    public readonly ordersProductType$ = computed(() => this.uiState().ordersProductType);

    private getOrderInvoiceProductTypeUseCase: GetOrderInvoiceProductTypeUseCase;

    constructor(private orderInvoiceProductTypeRepository: OrderInvoiceProductTypeDataRepository) {
        this.getOrderInvoiceProductTypeUseCase = new GetOrderInvoiceProductTypeUseCase(this.orderInvoiceProductTypeRepository);
    }

    public async loadInvoiceProductType(): Promise<void> {
        try {
            this.updateState({ 
                loading: true, 
                error: null 
            });
            const invoiceProductTypes = await firstValueFrom(this.getOrderInvoiceProductTypeUseCase.execute());
            this.updateState({ InvoiceProductType: invoiceProductTypes });
        } catch (error) {
            this.updateState({ error: 'Failed to load order invoice product type' });
        } finally {
            this.updateState({ loading: false });
        }
    }

    private updateState(newState: Partial<OrderInvoiceProductUiState>): void {
        this.uiState.set({ ...this.uiState(), ...newState });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}