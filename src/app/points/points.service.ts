import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class PointsService {
/**
 * The point components listen to this to know when to reload the table.
*/
    public reload: Subject<boolean> = new Subject<boolean>();
    constructor() { }
}
