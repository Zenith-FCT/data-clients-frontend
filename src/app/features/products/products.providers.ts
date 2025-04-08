import { Provider } from "@angular/core";
import { PRODUCTS_REPOSITORY } from "./domain/tokens/products-repository.token";
import { ProductsDataRepository } from "./data/products-data-repository";
import { ProductBillingViewModel } from "./presentation/product-billing.view-model";
import { ProductSalesViewModel } from "./presentation/product-sales.view-model";

export const productsProviders: Provider[] = [
    { provide: PRODUCTS_REPOSITORY, useExisting: ProductsDataRepository },
    ProductsDataRepository,
    ProductBillingViewModel,
    ProductSalesViewModel
];