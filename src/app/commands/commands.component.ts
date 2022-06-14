import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-commands',
    templateUrl: './commands.component.html',
    styleUrls: ['./commands.component.scss']
})
export class CommandsComponent implements OnInit {
    public currentPage: number = 1;
    constructor() { }

    ngOnInit(): void {
    }

    setPage(page: number) {
        this.currentPage = page;
    }
}
