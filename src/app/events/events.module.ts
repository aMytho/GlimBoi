import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';
import { RaffleComponent } from './raffle/raffle.component';
import { GiveawayComponent } from './giveaway/giveaway.component';
import { PollComponent } from './poll/poll.component';
import { GlimrealmComponent } from './glimrealm/glimrealm.component';
import { BankheistComponent } from './bankheist/bankheist.component';
import { GlimroyaleComponent } from './glimroyale/glimroyale.component';
import { DuelComponent } from './duel/duel.component';
import { EightballComponent } from './eightball/eightball.component';
import { GambleComponent } from './gamble/gamble.component';
import { QueueComponent } from './queue/queue.component';
import { EventsComponent } from './events.component';


@NgModule({
  declarations: [
    RaffleComponent,
    GiveawayComponent,
    PollComponent,
    GlimrealmComponent,
    BankheistComponent,
    GlimroyaleComponent,
    DuelComponent,
    EightballComponent,
    GambleComponent,
    QueueComponent,
    EventsComponent
  ],
  imports: [
    CommonModule,
    EventsRoutingModule
  ]
})
export class EventsModule {}