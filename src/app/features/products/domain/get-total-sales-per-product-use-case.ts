import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IProductsRepository } from './iproducts-repository.interface';
import { PRODUCTS_REPOSITORY } from './tokens/products-repository.token';
import { TotalSalesPerProductModel } from './total-sales-per-product.model';

@Injectable({
  providedIn: 'root'
})
export class GetTotalSalesPerProductUseCase {
  constructor(@Inject(PRODUCTS_REPOSITORY) private productsRepository: IProductsRepository) {}

  execute(): Observable<TotalSalesPerProductModel[]> {
    return this.productsRepository.getTotalSalesPerProduct();
  }
}
