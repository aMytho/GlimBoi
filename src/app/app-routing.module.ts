import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    {path: "commands", loadChildren: () => import('./commands/commands.module').then(m => m.CommandsModule)},
    {path: "points", loadChildren: () => import('./points/points.module').then(m => m.PointsModule)},
    {path: "events", loadChildren: () => import('./events/events.module').then(m => m.EventsModule)},
    {path: "users", loadChildren: () => import('./users/users.module').then(m => m.UsersModule)},
    {path: "ranks", loadChildren: () => import('./ranks/ranks.module').then(m => m.RanksModule)},
    {path: "media", loadChildren: () => import('./media/media.module').then(m => m.MediaModule)},
    {path: "moderation", loadChildren: () => import('./moderation/moderation.module').then(m => m.ModerationModule)},
    {path: "integrations", loadChildren: () => import('./integrations/integrations.module').then(m => m.IntegrationsModule)},
    {path: "chat", loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule)},
    { path: 'points', loadChildren: () => import('./points/points.module').then(m => m.PointsModule) },
    { path: 'music', loadChildren: () => import('./music/music.module').then(m => m.MusicModule) },
    {path: "**", component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
