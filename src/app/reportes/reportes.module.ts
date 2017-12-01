import { NgModule }      from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule } from "@angular/forms";
import { DataTableModule } from "angular2-datatable";

import { HttpModule } from "@angular/http";

import { ReportesComponent }   from './reportes.component';
import { Journal2Component }   from './journal2/journal2.component';
import { DataFilterPipe }      from '../pipes/data-filter.pipe';
import { Journal3Component }   from './journal3/journal3.component';
import { LogHmaComponent }   from './log-hma/log-hma.component';
import { TableModule }         from 'ngx-easy-table';


@NgModule({
    imports:      [
        CommonModule,
        DataTableModule,
        FormsModule,
        HttpModule,
        TableModule,
    ],
    declarations: [
        ReportesComponent,
        DataFilterPipe,
        Journal2Component,
        Journal3Component,
        LogHmaComponent
    ],
    exports: [ReportesComponent],
    //bootstrap: [ReportesComponent]
})

export class ReportesModule { }