import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IProductsRepository } from './iproducts-repository.interface';
import { PRODUCTS_REPOSITORY } from './tokens/products-repository.token';
import { TopProductsByMonthModel } from './top-products-by-month.model';

@Injectable({
    providedIn: 'root'
})
export class GetTopProductsByMonthUseCase {
    constructor(@Inject(PRODUCTS_REPOSITORY) private productsRepository: IProductsRepository) {}

    execute(): Observable<TopProductsByMonthModel[]> {
        return this.productsRepository.getTopProductsByMonth();
    }
}
