import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RanksRoutingModule } from './ranks-routing.module';
import { RanksComponent } from './ranks.component';


@NgModule({
    declarations: [
        RanksComponent
    ],
    imports: [
        CommonModule,
        RanksRoutingModule
    ]
})
export class RanksModule {}