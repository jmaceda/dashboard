/**
 *  app/reportes/reportes.module.ts
 */

import { NgModule }                     from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from "@angular/forms";
import { HttpModule }                   from "@angular/http";

import { ReportesComponent }            from './reportes.component';
import { DataFilterPipe }               from '../pipes/data-filter.pipe';
import { AclaracionesComponent }        from './aclaraciones/aclara.component';
import { TableModule }                  from 'ngx-easy-table';

import { RetirosEtvComponent }              from './retiros-etv/retiros-etv.component';

import { DepositosPorTiendaService }    from '../services/acumulado-por-deposito.service';

@NgModule({
    imports:      [
        CommonModule,
        FormsModule,
        HttpModule,
        TableModule,
    ],
    declarations: [
        ReportesComponent,
        DataFilterPipe,

    ],
    providers: [
        DepositosPorTiendaService
    ],
    exports: [ReportesComponent],
})

export class ReportesModule { }