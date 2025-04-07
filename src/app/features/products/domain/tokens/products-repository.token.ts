import { InjectionToken } from '@angular/core';
import { IProductsRepository } from '../iproducts-repository.interface';

export const PRODUCTS_REPOSITORY = new InjectionToken<IProductsRepository>('PRODUCTS_REPOSITORY');