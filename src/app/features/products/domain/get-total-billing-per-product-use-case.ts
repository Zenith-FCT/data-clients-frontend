import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IProductsRepository } from './iproducts-repository.interface';
import { PRODUCTS_REPOSITORY } from './tokens/products-repository.token';
import { TotalBillingPerProductModel } from './total-billing-per-product.model';

@Injectable({
    providedIn: 'root'
})
export class GetTotalBillingPerProductUseCase {
    constructor(@Inject(PRODUCTS_REPOSITORY) private productsRepository: IProductsRepository) {}

    execute(): Observable<TotalBillingPerProductModel[]> {
        return this.productsRepository.getTotalBillingPerProduct();
    }
}