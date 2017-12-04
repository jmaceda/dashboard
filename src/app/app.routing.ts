/*
*/


import { NgModule }                 from '@angular/core';
import { CommonModule, }            from '@angular/common';
import { BrowserModule  }           from '@angular/platform-browser';
import { Routes, RouterModule }     from '@angular/router';

import { HomeComponent }            from './home/home.component';
import { UserComponent }            from './user/user.component';
import { TablesComponent }          from './tables/tables.component';
import { TypographyComponent }      from './typography/typography.component';
import { IconsComponent }           from './icons/icons.component';
import { MapsComponent }            from './maps/maps.component';
import { NotificationsComponent }   from './notifications/notifications.component';
import { UpgradeComponent }         from './upgrade/upgrade.component';
import { ReportesComponent }        from './reportes/reportes.component';
import { AtmsComponent }            from './atms/atms.component';
import { JournalComponent }         from './reportes/journal/journal.component';
import { Journal2Component }        from './reportes/journal2/journal2.component';
import { AclaracionesComponent }    from './reportes/aclaraciones/aclara.component';
import { LogHmaComponent }          from './reportes/log-hma/log-hma.component';



const routes: Routes =[
    { path: 'atms',           component: AtmsComponent },
    { path: 'operaciones',    component: HomeComponent },
    { path: 'journal',        component: JournalComponent },
    { path: 'journal2',       component: Journal2Component },
    { path: 'aclaraciones',   component: AclaracionesComponent },
    { path: 'loghma',         component: LogHmaComponent },
    //{ path: 'reportes',       component: ReportesComponent },
    { path: 'user',           component: UserComponent },
    { path: 'table',          component: TablesComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    { path: 'notifications',  component: NotificationsComponent },
    { path: 'upgrade',        component: UpgradeComponent },
    { path: '',  redirectTo: 'atms',   pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
