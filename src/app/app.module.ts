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

//import { ParamsAtmsComponent }              from './atms/params-atms/params-atms.component';
import { FiltrosConsultasComponent }        from './shared/filtros-consultas/filtros-consultas.component';
//import { DataTableModule }                  from 'angular-4-data-table-bootstrap-4';

import { AtmsComponent }                    from './atms/atms.component';
import { AtmsEstatusComponent }             from './atms/estatus/atms-estatus.component';
import { ResumenCifrasComponent }           from './atms/resumenCifras/resumen-cifras.component';
import { JournalComponent }                 from './reportes/journal/journal.component';
import { LogHmaComponent }                  from './reportes/log-hma/log-hma.component';
import { TotalesPorTiendaComponent }        from './reportes/totales-por-tienda/totales-por-tienda.component';
import { ResumenDeEfectivo }                from './reportes/resumen-efectivo/resumen-efectivo.component';
import { DetallePorTienda }                 from './reportes/detalle-por-tienda/detalle-por-tienda.component';
import { RetirosEtvComponent }              from './reportes/retiros-etv/retiros-etv.component';

import { ReportesModule }                   from './reportes/reportes.module';
//import { ParamsComponent }                  from './reportes/params/params.component';
import { AclaracionesComponent }            from './reportes/aclaraciones/aclara.component';
//import { NgbdModalContent }                 from './utils/ngbd-modal-content';
//import { DataFilterPipe }                   from './pipes/data-filter.pipe';
import { AngularDateTimePickerModule }      from 'angular2-datetimepicker';
import { BsModalModule }                    from 'ng2-bs3-modal';

import { DataBaseService }                  from './services/data-base.service';
import { ExportToCSVService }               from './services/export-to-csv.service';
import { FiltrosUtilsService }              from './services/filtros-utils.service';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { HorzVertScrolling } from './tmp/ngx-datatable/basic/scrolling.component';
import { RetirosHmaComponent }              from './tmp/retiros-hma/retiros-hma.component';
import { EfectDispCoponent }                from './reportes/efectivo-disponible/efectivo-disponible.component';

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
    //ParamsComponent,
    AclaracionesComponent,
    TotalesPorTiendaComponent,
    //ParamsAtmsComponent,
    FiltrosConsultasComponent,
    ResumenDeEfectivo,
    DetallePorTienda,
    HorzVertScrolling,
    RetirosEtvComponent,
    RetirosHmaComponent,
    EfectDispCoponent

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
    BsModalModule,
    NgxDatatableModule

  ],
  entryComponents: [],
  exports: [],
  providers: [
    DataBaseService,
    ExportToCSVService,
    FiltrosUtilsService
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
  