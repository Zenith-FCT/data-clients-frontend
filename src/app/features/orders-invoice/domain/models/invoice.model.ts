export interface Invoice {
    id: string;
    orderNumber: string;
    client: Client;
    date: Date;
    product:Product;
    amount: number;

}
export enum Client{
    RECURRENTE = 'RECURRENTE',
    UHICO = 'UHICO'

}
export enum Product{
    MASTER = 'MASTER',
    CURSO = 'CURSO',
    MEMBRESIA = 'MEMBRESIA'
}