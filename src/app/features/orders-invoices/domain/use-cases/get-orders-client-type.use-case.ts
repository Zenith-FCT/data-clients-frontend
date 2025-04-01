import { Observable, map } from "rxjs";
import { InvoiceClientsTypeRepository } from "../repositories/invoice-client-type-repository";
import { InvoiceClientsTypeModel } from "../models/invoice-clients-type.model";

export class GetOrdersClientsTypeUseCase {
    constructor(private invoiceClientsTypeRepository: InvoiceClientsTypeRepository) {}

    execute(): Observable<InvoiceClientsTypeModel[]> {
        return this.invoiceClientsTypeRepository.getInvoiceClientType().pipe(
            map(invoiceClientsList => {
                if (!invoiceClientsList || !Array.isArray(invoiceClientsList) || invoiceClientsList.length === 0) {
                    return [];
                }

                const yearlyData = new Map<string, { 
                    year: string, 
                    recurentTotal: number, 
                    uniqueTotal: number,
                    totalRecurrentSales: number,
                    totalUniqueSales: number 
                }>();
                
                invoiceClientsList.forEach(item => {
                    const year = new Date(item.date).getFullYear().toString();
                    const recurent = Number(item.recurent) || 0;
                    const unique = Number(item.unique) || 0;
                    const totalRecurrentSales = Number(item.totalRecurrentSales) || 0;
                    const totalUniqueSales = Number(item.totalUniqueSales) || 0;
                    
                    if (yearlyData.has(year)) {
                        const currentYearData = yearlyData.get(year)!;
                        currentYearData.recurentTotal += recurent;
                        currentYearData.uniqueTotal += unique;
                        currentYearData.totalRecurrentSales += totalRecurrentSales;
                        currentYearData.totalUniqueSales += totalUniqueSales;
                    } else {
                        yearlyData.set(year, { 
                            year, 
                            recurentTotal: recurent, 
                            uniqueTotal: unique,
                            totalRecurrentSales: totalRecurrentSales,
                            totalUniqueSales: totalUniqueSales
                        });
                    }
                });
                
                return Array.from(yearlyData.values()).map(yearData => 
                    new InvoiceClientsTypeModel(
                        yearData.year,
                        yearData.year,
                        yearData.recurentTotal.toString(),
                        yearData.uniqueTotal.toString(),
                        yearData.totalRecurrentSales.toString(),
                        yearData.totalUniqueSales.toString()
                    )
                );
            })
        );
    }
}