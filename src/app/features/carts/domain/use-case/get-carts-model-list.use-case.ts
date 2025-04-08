import { Observable } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";
import { CartModel } from "../models/carts.model";

export class GetCartsModelListUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(): Observable<CartModel[]> {
        return this.cartsRepository.getCarts();
    }
}