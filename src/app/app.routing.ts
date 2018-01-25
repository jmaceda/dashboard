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
import { RetirosHmaComponent }              from './tmp/retiros-hma/retiros-hma.component';
import { EfectDispCoponent }               from './reportes/efectivo-disponible/efectivo-disponible.component';

import { HorzVertScrolling } from './tmp/ngx-datatable/basic/scrolling.component';
//import { SmartTableComponent } from './tmp/ng2-smart-table/smart-table.component';
import { RechazosHmaComponent }              from './tmp/rechazos-hma/rechazos-hma.component';

const routes: Routes =[
    { path: 'atms',           component: AtmsEstatusComponent },
    { path: 'resumen',        component: ResumenCifrasComponent },
    { path: 'operaciones',    component: ResumenOperacionesComponent },
    { path: 'journal',        component: JournalComponent },
    { path: 'aclaraciones',   component: AclaracionesComponent },
    { path: 'loghma',         component: LogHmaComponent },
    { path: 'totaltienda',    component: TotalesPorTiendaComponent },
    { path: 'resumenefectivo',component: ResumenDeEfectivo },
    { path: 'detalletienda',  component: DetallePorTienda },

    { path: 'retirosetv',     component: RetirosEtvComponent },
    { path: 'retiroshma',     component: RetirosHmaComponent },
    { path: 'efectdisp',      component: EfectDispCoponent },

    { path: 'rechazoshma',     component: RechazosHmaComponent },

    { path: 'HorzVertScrolling',  component: HorzVertScrolling },
    //{ path: 'SmartTable',  component: SmartTableComponent },

    { path: 'user',           component: UserComponent },
    { path: 'table',          component: TablesComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    { path: 'notifications',  component: NotificationsComponent },
    { path: 'upgrade',        component: UpgradeComponent },
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
