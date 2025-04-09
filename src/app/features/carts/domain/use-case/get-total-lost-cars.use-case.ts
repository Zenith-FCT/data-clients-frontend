import { Observable, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";
import { CartModel } from "../models/carts.model";

export class GetTotalLostCarsUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(year?: number): Observable<number> {
        return this.cartsRepository.getCarts().pipe(
            map((carts: CartModel[]) => {
                let filteredCarts = carts;
                
                if (year) {
                    filteredCarts = carts.filter(cart => {
                        const cartYear = parseInt(cart.date.split('-')[0]);
                        return cartYear === year;
                    });
                }
                
                return filteredCarts.reduce((sum, cart) => sum + parseFloat(cart.total), 0);
            })
        );
    }
}