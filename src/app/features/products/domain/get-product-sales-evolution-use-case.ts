import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IProductsRepository } from "./iproducts-repository.interface";
import { ProductSalesEvolutionModel } from "./product-sales-evolution.model";
import { PRODUCTS_REPOSITORY } from "./tokens/products-repository.token";

@Injectable()
export class GetProductSalesEvolutionUseCase {
    constructor(
        @Inject(PRODUCTS_REPOSITORY) private productsRepository: IProductsRepository
    ) {}

    execute(): Observable<ProductSalesEvolutionModel[]> {
        return this.productsRepository.getProductSalesEvolution();
    }
}
