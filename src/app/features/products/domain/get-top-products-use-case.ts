import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TopProductModel } from './top-products.model';
import { PRODUCTS_REPOSITORY } from './tokens/products-repository.token';
import { IProductsRepository } from './iproducts-repository.interface';

@Injectable()
export class GetTopProductsUseCase {
  constructor(@Inject(PRODUCTS_REPOSITORY) private productsRepository: IProductsRepository) {}

  execute(): Observable<TopProductModel[]> {
    return this.productsRepository.getTopProducts();
  }
}
