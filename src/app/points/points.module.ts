import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PointsRoutingModule } from './points-routing.module';
import { PointsComponent } from './points.component';
import { TableComponent } from './table/table.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PointsComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    PointsRoutingModule,
    FormsModule
  ]
})
export class PointsModule { }
