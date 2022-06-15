import { Component } from '@angular/core';
import { ElectronService } from './core/electron/electron.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor(private electronService: ElectronService) {
        console.log("Welcome to Glimboi!");
    }

    window(arg: "close" | "minimize" | "maximize" | "refresh" | "import") {
        this.electronService.ipcRenderer.send("window", arg);
    }
}
