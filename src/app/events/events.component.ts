import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
    public currentPage: number = 1;
    constructor() { }

    ngOnInit(): void {
    }

    setPage(page: number) {
        this.currentPage = page;
    }
}
