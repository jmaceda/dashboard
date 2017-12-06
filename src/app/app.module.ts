import { BrowserModule }                    from '@angular/platform-browser';
import { NgModule }                         from '@angular/core';
import { HttpModule }                       from '@angular/http';
import { RouterModule }                     from '@angular/router';
import { FormsModule }                      from '@angular/forms';
import { ReactiveFormsModule }              from '@angular/forms';

import { AppRoutingModule }                 from './app.routing';
import { NavbarModule }                     from './shared/navbar/navbar.module';
import { FooterModule }                     from './shared/footer/footer.module';
import { SidebarModule }                    from './sidebar/sidebar.module';
import { LbdModule }                        from './lbd/lbd.module';
import { AppComponent }                     from './app.component';
import { HomeComponent }                    from './home/home.component';
import { UserComponent }                    from './user/user.component';
import { TablesComponent }                  from './tables/tables.component';
import { TypographyComponent }              from './typography/typography.component';
import { IconsComponent }                   from './icons/icons.component';
import { MapsComponent }                    from './maps/maps.component';
import { NotificationsComponent }           from './notifications/notifications.component';
import { UpgradeComponent }                 from './upgrade/upgrade.component';
import { TableModule }                      from 'ngx-easy-table';
import { NgbModule }                        from '@ng-bootstrap/ng-bootstrap';

import { DataTableModule }                  from 'angular-4-data-table-fix';
import { AtmsComponent }                    from './atms/atms.component';
import { AtmsEstatusComponent }             from './atms/estatus/atms-estatus.component';
import { JournalComponent }                 from './reportes/journal/journal.component';
import { LogHmaComponent }                  from './reportes/log-hma/log-hma.component';
import { ReportesModule }                   from './reportes/reportes.module';
import { ParamsComponent }                  from './reportes/params/params.component';
import { AclaracionesComponent }            from './reportes/aclaraciones/aclara.component';
import { NgbdModalContent }                 from './utils/ngbd-modal-content';
import { DataFilterPipe }       from './pipes/data-filter.pipe';

import { AngularDateTimePickerModule }      from 'angular2-datetimepicker';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent,
    TablesComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
    AtmsComponent,
    AtmsEstatusComponent,
    JournalComponent,
    LogHmaComponent,
    ParamsComponent,
    AclaracionesComponent,

  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NavbarModule,
    FooterModule,
    SidebarModule,
    RouterModule,
    AppRoutingModule,
    LbdModule,
    ReactiveFormsModule,
    DataTableModule,
    ReportesModule,
    AngularDateTimePickerModule,
    TableModule,
    NgbModule.forRoot(),

  ],
  entryComponents: [],
  exports: [],
  providers: [
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
  