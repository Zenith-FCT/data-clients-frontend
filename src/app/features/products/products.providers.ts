import { Provider } from "@angular/core";
import { PRODUCTS_REPOSITORY } from "./domain/tokens/products-repository.token";
import { ProductsDataRepository } from "./data/products-data-repository";
import { ProductBillingViewModel } from "./presentation/product-billing.view-model";
import { ProductSalesViewModel } from "./presentation/product-sales.view-model";
import { TopProductsViewModel } from "./presentation/top-products.view-model";
import { TopProductsByMonthViewModel } from "./presentation/top-products-by-month.view-model";
import { GetTopProductsUseCase } from "./domain/get-top-products-use-case";
import { GetTopProductsByMonthUseCase } from "./domain/get-top-products-by-month-use-case";

export const productsProviders: Provider[] = [
    { provide: PRODUCTS_REPOSITORY, useExisting: ProductsDataRepository },
    ProductsDataRepository,
    ProductBillingViewModel,
    ProductSalesViewModel,
    TopProductsViewModel,
    TopProductsByMonthViewModel,
    GetTopProductsUseCase,
    GetTopProductsByMonthUseCase
];