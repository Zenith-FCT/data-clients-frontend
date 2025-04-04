import { Observable } from "rxjs";
import { LtvRepository } from "../repositories/ltv-repository";
import { LtvModel } from "../models/ltv.model";

export class GetMonthlyLtvUseCase {
    constructor(private ltvRepository: LtvRepository) {}

    execute(): Observable<LtvModel[]> {
        return this.ltvRepository.getLtv();
    }
}