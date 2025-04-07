import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProductsRepository } from '../domain/iproducts-repository.interface';
import { ProductsApiService } from './remote/api-json/products-api.service';
import { TotalBillingPerProductModel } from '../domain/total-billing-per-product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductsDataRepository implements IProductsRepository {
    constructor(private productsApiService: ProductsApiService) {
        console.log('ProductsDataRepository initialized');
    }

    getTotalBillingPerProduct(): Observable<TotalBillingPerProductModel[]> {
        // Simplemente pasamos los datos del servicio API directamente
        // ya que ahora ya vienen en el formato del modelo TotalBillingPerProductModel
        return this.productsApiService.getTotalBillingPerProduct();
    }
}