import { Provider } from "@angular/core";
import { PRODUCTS_REPOSITORY } from "./domain/tokens/products-repository.token";
import { ProductsDataRepository } from "./data/products-data-repository";

export const productsProviders: Provider[] = [
    { provide: PRODUCTS_REPOSITORY, useExisting: ProductsDataRepository }
];