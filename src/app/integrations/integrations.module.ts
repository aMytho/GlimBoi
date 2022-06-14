import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntegrationsRoutingModule } from './integrations-routing.module';
import { IntegrationsComponent } from './integrations.component';


@NgModule({
  declarations: [
    IntegrationsComponent
  ],
  imports: [
    CommonModule,
    IntegrationsRoutingModule
  ]
})
export class IntegrationsModule { }
