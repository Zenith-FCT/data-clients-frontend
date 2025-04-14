import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { IProductsRepository } from '../domain/iproducts-repository.interface';
import { TopProductModel } from '../domain/top-products.model';
import { TotalBillingPerProductModel } from '../domain/total-billing-per-product.model';
import { TotalSalesPerProductModel } from '../domain/total-sales-per-product.model';
import { TopProductsByMonthModel } from '../domain/top-products-by-month.model';
import { ProductsApiService } from './remote/api-json/products-api.service';

@Injectable()
export class ProductsDataRepository implements IProductsRepository {
  constructor(private productsApiService: ProductsApiService) {}

  getTopProducts(): Observable<TopProductModel[]> {
    return this.productsApiService.getTopProducts().pipe(
      tap(products => console.log('ProductsDataRepository: Top products loaded:', products)),
      catchError(error => {
        console.error('ProductsDataRepository: Error getting top products:', error);
        throw error;
      })
    );
  }

  getTotalBillingPerProduct(): Observable<TotalBillingPerProductModel[]> {
    return this.productsApiService.getTotalBillingPerProduct().pipe(
      tap(products => console.log('ProductsDataRepository: Total billing per product loaded:', products.length)),
      catchError(error => {
        console.error('ProductsDataRepository: Error getting total billing per product:', error);
        throw error;
      })
    );
  }
  getTotalSalesPerProduct(): Observable<TotalSalesPerProductModel[]> {
    return this.productsApiService.getTotalSalesPerProduct().pipe(
      tap(products => console.log('ProductsDataRepository: Total sales per product loaded:', products.length)),
      catchError(error => {
        console.error('ProductsDataRepository: Error getting total sales per product:', error);
        throw error;
      })
    );
  }

  getTopProductsByMonth(): Observable<TopProductsByMonthModel[]> {
    return this.productsApiService.getTopProductsByMonth().pipe(
      tap(products => console.log('ProductsDataRepository: Top products by month loaded:', products.length)),
      catchError(error => {
        console.error('ProductsDataRepository: Error getting top products by month:', error);
        throw error;
      })
    );
  }
}
