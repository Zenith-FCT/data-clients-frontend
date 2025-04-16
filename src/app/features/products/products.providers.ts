import { Provider } from "@angular/core";
import { PRODUCTS_REPOSITORY } from "./domain/tokens/products-repository.token";
import { ProductsDataRepository } from "./data/products-data-repository";
import { ProductBillingViewModel } from "./presentation/components/product-billing-chart/product-billing.view-model";
import { ProductSalesViewModel } from "./presentation/components/product-sales-chart/product-sales.view-model";
import { TopProductsViewModel } from "./presentation/components/top-products-table/top-products.view-model";
import { TopProductsByMonthViewModel } from "./presentation/components/top-products-by-month-chart/top-products-by-month.view-model";
import { ProductSalesEvolutionViewModel } from "./presentation/components/product-sales-evolution-chart/product-sales-evolution.view-model";
import { GetTopProductsUseCase } from "./domain/get-top-products-use-case";
import { GetTopProductsByMonthUseCase } from "./domain/get-top-products-by-month-use-case";
import { GetProductSalesEvolutionUseCase } from "./domain/get-product-sales-evolution-use-case";

export const productsProviders: Provider[] = [
    { provide: PRODUCTS_REPOSITORY, useExisting: ProductsDataRepository },
    ProductsDataRepository,
    ProductBillingViewModel,
    ProductSalesViewModel,
    TopProductsViewModel,
    TopProductsByMonthViewModel,
    ProductSalesEvolutionViewModel,
    GetTopProductsUseCase,
    GetTopProductsByMonthUseCase,
    GetProductSalesEvolutionUseCase
];