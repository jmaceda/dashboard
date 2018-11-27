/*
*/
import { NgModule }                         from '@angular/core';
import { CommonModule, }                    from '@angular/common';
import { BrowserModule  }                   from '@angular/platform-browser';
import { Routes, RouterModule }             from '@angular/router';

import { ResumenOperacionesComponent }      from './atms/resumen-operaciones/resumen-operaciones.component';
import { UserComponent }                    from './user/user.component';
import { TablesComponent }                  from './tables/tables.component';
import { TypographyComponent }              from './typography/typography.component';
import { IconsComponent }                   from './icons/icons.component';
import { MapsComponent }                    from './maps/maps.component';
import { NotificationsComponent }           from './notifications/notifications.component';
import { UpgradeComponent }                 from './upgrade/upgrade.component';
import { ReportesComponent }                from './reportes/reportes.component';
import { AtmsComponent }                    from './atms/atms.component';
import { JournalComponent }                 from './reportes/journal/journal.component';
import { AclaracionesComponent }            from './reportes/aclaraciones/aclara.component';
import { LogHmaComponent }                  from './reportes/log-hma/log-hma.component';
import { TotalesPorTiendaComponent }        from './reportes/totales-por-tienda/totales-por-tienda.component';
import { ResumenDeEfectivo }                from './reportes/resumen-efectivo/resumen-efectivo.component';
import { DetallePorTienda }                 from './reportes/detalle-por-tienda/detalle-por-tienda.component';

import { AtmsEstatusComponent }             from './atms/estatus/atms-estatus.component';
import { ResumenCifrasComponent }           from './atms/resumenCifras/resumen-cifras.component';
import { RetirosEtvComponent }              from './reportes/retiros-etv/retiros-etv.component';
import { RetirosHmaComponent }              from './reportes/retiros-hma/retiros-hma.component';
import { EfectDispXAtmCoponent }            from './reportes/efect-disp-x-atm/efect-disp-x-atm.component';
import { LogHardwareComponent }             from './tmp/tmpLogHardware/log-hardware.component';
import { OpersFinancierasComponent }        from './atms/opers-financieras/opers-financieras.component';
import { OpersFinansXCajeroComponent }      from './atms/opers-finans-x-cajero/opers-finans-x-cajero.component';
import { OpersFinanAcumula2Component }      from './atms/opers-finan-acumula2/opers-finan-acumula2.component';
import { RechazosHmaComponent }             from './tmp/rechazos-hma/rechazos-hma.component';
import { TiempoPromOperComponent }          from './atms/tiempo-promedio-oper/tiempo-promedio-oper.component';
import { ManualGrgComponent }               from './docs/manual-grg.component';
import { ReporteMensualComponent }          from './reportes/banxico/reporte-mensual/reporte-mensual.component';
import { ImpresionesOperComponent }         from './reportes/impresiones-oper/impresiones-oper.component';
import { VerCoreFlujoComponent }            from './atms/ver-core-flujo/ver-core-flujo.component';

import { OpersFinanAcumulaComponent }      from './atms/opers-finan-acumula/opers-finan-acumula.component';
import { EfectDispXGpoCoponent }            from './reportes/efect-disp-x-gpo/efect-disp-x-gpo.component';
import { GruposAtmsComponent }              from './atms/grupos-atms/grupos-atms.component';

const routes: Routes =[
    { path: 'atms',                 component: AtmsEstatusComponent },
    { path: 'resumen',              component: ResumenCifrasComponent },
    { path: 'operaciones',          component: ResumenOperacionesComponent },
    { path: 'journal',              component: JournalComponent },
    { path: 'aclaraciones',         component: AclaracionesComponent },
    { path: 'loghma',               component: LogHmaComponent },
    { path: 'totaltienda',          component: TotalesPorTiendaComponent },
    { path: 'resumenefectivo',      component: ResumenDeEfectivo },
    { path: 'detalletienda',        component: DetallePorTienda },
    { path: 'retirosetv',           component: RetirosEtvComponent },
    { path: 'retiroshma',           component: RetirosHmaComponent },
    { path: 'efectdisp',            component: EfectDispXAtmCoponent },
    { path: 'rechazoshma',          component: RechazosHmaComponent },
    { path: 'loghardware',          component: LogHardwareComponent },
    { path: 'promopers',            component: TiempoPromOperComponent },
    { path: 'opersfinan',           component: OpersFinancierasComponent },
    { path: 'opersfinanxcajero',    component: OpersFinansXCajeroComponent },
    { path: 'opersfinanacumula2',   component: OpersFinanAcumula2Component },
    { path: 'reportebanxico',       component: ReporteMensualComponent },
    { path: 'manualgrg',            component: ManualGrgComponent },
    { path: 'user',                 component: UserComponent },
    { path: 'table',                component: TablesComponent },
    { path: 'typography',           component: TypographyComponent },
    { path: 'icons',                component: IconsComponent },
    { path: 'maps',                 component: MapsComponent },
    { path: 'notifications',        component: NotificationsComponent },
    { path: 'upgrade',              component: UpgradeComponent },
    { path: 'impresiones',          component: ImpresionesOperComponent },
    { path: 'versionesapp',         component: VerCoreFlujoComponent },
    { path: 'opersfinanacumula',    component: OpersFinanAcumulaComponent },
    { path: 'efectdispgpo',         component: EfectDispXGpoCoponent },
    { path: 'gruposcajeros',        component: GruposAtmsComponent },

    { path: '',  redirectTo: 'atms',   pathMatch: 'full' },
    { path: '**',  redirectTo: 'atms',   pathMatch: 'full' }
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
