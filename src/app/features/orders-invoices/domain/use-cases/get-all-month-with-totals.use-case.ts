import { Observable } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';
import { MonthlySalesModel } from '../models/monthly-sales.model';

export class GetAllMonthWithTotalsUseCase {
    constructor(private monthlySalesRepository: MonthlySalesRepository) {}

    execute(): Observable<MonthlySalesModel[]> {
        return this.monthlySalesRepository.getMonthlySales();
    }
}