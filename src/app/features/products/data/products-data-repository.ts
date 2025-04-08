import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProductsRepository } from '../domain/iproducts-repository.interface';
import { ProductsApiService } from './remote/api-json/products-api.service';
import { TotalBillingPerProductModel } from '../domain/total-billing-per-product.model';
import { TotalSalesPerProductModel } from '../domain/total-sales-per-product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsDataRepository implements IProductsRepository {
  constructor(private productsApiService: ProductsApiService) {
    console.log('ProductsDataRepository initialized');
  }

  getTotalBillingPerProduct(): Observable<TotalBillingPerProductModel[]> {
    return this.productsApiService.getTotalBillingPerProduct();
  }
  
  getTotalSalesPerProduct(): Observable<TotalSalesPerProductModel[]> {
    return this.productsApiService.getTotalSalesPerProduct();
  }
}