import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandsComponent } from './commands.component';
import { CommandsRoutingModule } from './commands-routing.module';
import { VariablesComponent } from './variables/variables.component';
import { SettingsComponent } from './settings/settings.component';
import { DefaultComponent } from './default/default.component';



@NgModule({
  declarations: [
    CommandsComponent,
    VariablesComponent,
    SettingsComponent,
    DefaultComponent
  ],
  imports: [
    CommonModule,
    CommandsRoutingModule
  ]
})
export class CommandsModule {}