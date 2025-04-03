import { Observable, from } from "rxjs";
import { ApiService } from "./remote/api/api.service";
import { Injectable } from "@angular/core";
import { LtvRepository } from "../../domain/repositories/ltv-reposiroty";
import { LtvModel } from "../../domain/models/ltv.model";

@Injectable({
    providedIn: 'root'
})
export class LtvDataRepository implements LtvRepository {

    constructor(private apiService: ApiService) {}

    getLtv(): Observable<LtvModel[]> {
        return from(this.apiService.getLtv());
    }
}
