import { Observable, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";
import { CartModel } from "../models/carts.model";


export class GetTotalLostCarsUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(): Observable<number> {
        return this.cartsRepository.getCarts().pipe(
            map((carts: CartModel[]) => carts.length)
        );
    }
}