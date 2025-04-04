import { Observable } from "rxjs";
import { LtvModel } from "../models/ltv.model";

export interface LtvRepository {
    getLtv(): Observable<LtvModel[]>;
}