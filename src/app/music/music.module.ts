import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MusicRoutingModule } from './music-routing.module';
import { MusicComponent } from './music.component';
import { SonglistComponent } from './songlist/songlist.component';
import { SongComponent } from './songlist/song/song.component';


@NgModule({
  declarations: [
    MusicComponent,
    SonglistComponent,
    SongComponent
  ],
  imports: [
    CommonModule,
    MusicRoutingModule
  ]
})
export class MusicModule { }
