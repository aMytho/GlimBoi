import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DataTablesModule } from "angular-datatables";
import { settingsFactory } from './app.factory';
import { SettingsService } from './core/settings/settings.service';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        DataTablesModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: settingsFactory,
            deps: [SettingsService],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}