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
import { ResumenOperacionesComponent }                    from './atms/resumen-operaciones/resumen-operaciones.component';
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
import { ResumenCifrasComponent }           from './atms/resumenCifras/resumen-cifras.component';
import { JournalComponent }                 from './reportes/journal/journal.component';
import { LogHmaComponent }                  from './reportes/log-hma/log-hma.component';
import { TotalesPorTiendaComponent }        from './reportes/totales-por-tienda/totales-por-tienda.component';

import { ReportesModule }                   from './reportes/reportes.module';
import { ParamsComponent }                  from './reportes/params/params.component';
import { AclaracionesComponent }            from './reportes/aclaraciones/aclara.component';
import { NgbdModalContent }                 from './utils/ngbd-modal-content';
import { DataFilterPipe }                   from './pipes/data-filter.pipe';
import { AngularDateTimePickerModule }      from 'angular2-datetimepicker';
import { BsModalModule }                    from 'ng2-bs3-modal';

import { DataBaseService }                  from './services/data-base.service';
import { ExportToCSV }                  from './services/export-to-csv.service';

@NgModule({
  declarations: [
    AppComponent,
    ResumenOperacionesComponent,
    UserComponent,
    TablesComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
    AtmsComponent,
    AtmsEstatusComponent,
    ResumenCifrasComponent,
    JournalComponent,
    LogHmaComponent,
    ParamsComponent,
    AclaracionesComponent,
    TotalesPorTiendaComponent

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
    BsModalModule

  ],
  entryComponents: [],
  exports: [],
  providers: [
    DataBaseService,
    ExportToCSV
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
  