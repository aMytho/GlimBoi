import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModerationRoutingModule } from './moderation-routing.module';
import { ModerationComponent } from './moderation.component';


@NgModule({
  declarations: [
    ModerationComponent
  ],
  imports: [
    CommonModule,
    ModerationRoutingModule
  ]
})
export class ModerationModule { }
