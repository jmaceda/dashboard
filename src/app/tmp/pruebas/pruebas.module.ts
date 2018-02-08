/**
 *  app/reportes/pruebas.module.ts
 */

import { NgModule }                     from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from "@angular/forms";
import { BrowserModule }                from "@angular/platform-browser";
import { HttpModule }                   from "@angular/http";
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { SuperTableModule }             from 'ngx-super-table';
import { AgGridModule }                 from 'ag-grid-angular';

import { PruebasComponent }             from './pruebas.component';
import { DemoComponent }                from './demo-app/demo-app.component';
import { InstrumentComponent }          from './demo-app/instrument.component';

import { AgGridApp }                    from './ag-grid/ag-grid-app.component';

@NgModule({
    imports:      [
        CommonModule,
        FormsModule,
        HttpModule,
        HttpClientModule,
        BrowserModule,
        SuperTableModule,
        AgGridModule.withComponents([/*optional Angular Components to be used in the grid*/]),
    ],
    declarations: [
        PruebasComponent,
        DemoComponent,
        InstrumentComponent,
        AgGridApp
    ],
    providers: [
    ],
    exports: [],
    entryComponents: [
        InstrumentComponent
    ],
    bootstrap: [PruebasComponent]
})

export class PruebasModule { }