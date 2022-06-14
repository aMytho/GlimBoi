import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../core/electron/electron.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(private electronService: ElectronService) {}

    loadLink(arg: string) {
        this.electronService.loadLink(arg);
    }

    ngOnInit(): void {
    }
}