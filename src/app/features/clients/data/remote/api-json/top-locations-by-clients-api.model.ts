export class TopLocationsByClientsApi {
    constructor(
        public country: string,
        public city: string,
        public clientCount: number
    ) { }
}