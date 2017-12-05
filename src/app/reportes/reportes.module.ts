import { NgModule }      from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";

import { ReportesComponent }        from './reportes.component';
import { DataFilterPipe }           from '../pipes/data-filter.pipe';
import { AclaracionesComponent }    from './aclaraciones/aclara.component';


import { TableModule }              from 'ngx-easy-table';


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
    exports: [ReportesComponent],
})

export class ReportesModule { }