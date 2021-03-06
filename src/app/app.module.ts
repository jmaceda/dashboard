import { BrowserModule }                    from '@angular/platform-browser';
import { NgModule }                         from '@angular/core';
import { HttpModule }                       from '@angular/http';
import { RouterModule }                     from '@angular/router';
import { FormsModule }                      from '@angular/forms';
import { ReactiveFormsModule }              from '@angular/forms';

import { CommonModule } from '@angular/common';
import 'rxjs/add/observable/fromEvent';
import { Component, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';


import { AppRoutingModule }                 from './app.routing';
import { NavbarModule }                     from './shared/navbar/navbar.module';
import { FooterModule }                     from './shared/footer/footer.module';
import { SidebarModule }                    from './sidebar/sidebar.module';
import { LbdModule }                        from './lbd/lbd.module';
import { AppComponent }                     from './app.component';
import { ResumenOperacionesComponent }      from './atms/resumen-operaciones/resumen-operaciones.component';
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

import { FiltrosConsultasComponent }        from './shared/filtros-consultas/filtros-consultas.component';
import { OpersFinancierasComponent }        from './atms/opers-financieras/opers-financieras.component';
import { OpersFinansXCajeroComponent }      from './atms/opers-finans-x-cajero/opers-finans-x-cajero.component';
import { OpersFinanAcumula2Component }      from './atms/opers-finan-acumula2/opers-finan-acumula2.component';

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
//import { BsModalModule }                    from 'ng2-bs3-modal';

import { DataBaseService }                  from './services/data-base.service';
import { ExportToCSVService }               from './services/export-to-csv.service';
import { FiltrosUtilsService }              from './services/filtros-utils.service';


import { NgxDatatableModule }               from '@swimlane/ngx-datatable';

import { LogHardwareComponent }             from './tmp/tmpLogHardware/log-hardware.component';
import { RetirosHmaComponent }              from './reportes/retiros-hma/retiros-hma.component';
import { EfectDispXAtmCoponent }            from './reportes/efect-disp-x-atm/efect-disp-x-atm.component';
import { EfectDispXGpoCoponent }            from './reportes/efect-disp-x-gpo/efect-disp-x-gpo.component';

import { BlockUIModule }                    from 'ng-block-ui';
import { RechazosHmaComponent }             from './tmp/rechazos-hma/rechazos-hma.component';
import { PruebasModule }                    from './tmp/pruebas/pruebas.module';
import { TiempoPromOperComponent }          from './atms/tiempo-promedio-oper/tiempo-promedio-oper.component';
import { ManualGrgComponent }               from './docs/manual-grg.component';

import { PdfViewerModule }                  from 'ng2-pdf-viewer';

import { InfoGroupsService }                from './services/info-groups.service';
import { SoapService }                      from './services/soap.service';
import { ReporteMensualComponent }          from './reportes/banxico/reporte-mensual/reporte-mensual.component';
import { ImpresionesOperComponent }         from './reportes/impresiones-oper/impresiones-oper.component';
import { VerCoreFlujoComponent }            from './atms/ver-core-flujo/ver-core-flujo.component';


//import { Ng4LoadingSpinnerModule, Ng4LoadingSpinnerService  } from 'ng4-loading-spinner';

import { SweetAlertService } from 'ngx-sweetalert2';
import {Ng2Webstorage} from 'ng2-webstorage';


import { OpersFinanAcumulaComponent }       from './atms/opers-finan-acumula/opers-finan-acumula.component'
import { GruposAtmsComponent }              from './atms/grupos-atms/grupos-atms.component';

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
    AclaracionesComponent,
    TotalesPorTiendaComponent,
    FiltrosConsultasComponent,
    ResumenDeEfectivo,
    DetallePorTienda,
    RetirosEtvComponent,
    RetirosHmaComponent,
    EfectDispXAtmCoponent,
    OpersFinancierasComponent,
    OpersFinansXCajeroComponent,
    OpersFinanAcumula2Component,
    //SmartTableComponent
    RechazosHmaComponent,
    TiempoPromOperComponent,
    ManualGrgComponent,
    ReporteMensualComponent,
    LogHardwareComponent,
    ImpresionesOperComponent,
    VerCoreFlujoComponent,
    OpersFinanAcumulaComponent,
    EfectDispXGpoCoponent,
    GruposAtmsComponent,
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
    //BsModalModule,
    NgxDatatableModule,
    BlockUIModule,
    PruebasModule,
    PdfViewerModule,
    Ng2Webstorage,
    //  Ng4LoadingSpinnerModule.forRoot(),
    //SweetAlert2Module.forRoot()


    //Ng2SmartTableModule,
    //NbLayoutModule,
    //NbSidebarModule,
    //NbThemeModule.forRoot({ name: 'default' }), // this will enable the default theme, you can change this to `cosmic` to enable the dark theme

  ],
  entryComponents: [],
  exports: [],
  providers: [
    DataBaseService,
    ExportToCSVService,
    FiltrosUtilsService,
    InfoGroupsService,
    SoapService,
    SweetAlertService,

    //SmartTableService,
    //NbSidebarService
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
  