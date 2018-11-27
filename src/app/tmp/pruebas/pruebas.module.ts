/**
 *  app/reportes/pruebas.module.ts
 */

import { NgModule }                     from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from "@angular/forms";
import { BrowserModule }                from "@angular/platform-browser";
import { HttpModule }                   from "@angular/http";
import { HttpClientModule, HttpClient } from '@angular/common/http';

//import { SuperTableModule }             from 'ngx-super-table';

import { PruebasComponent }             from './pruebas.component';
//import { DemoComponent }                from './demo-app/demo-app.component';
//import { InstrumentComponent }          from './demo-app/instrument.component';

@NgModule({
    imports:      [
        CommonModule,
        FormsModule,
        HttpModule,
        HttpClientModule,
        BrowserModule,
        //SuperTableModule,
    ],
    declarations: [
        PruebasComponent,
        //DemoComponent,
        //InstrumentComponent,
    ],
    providers: [
    ],
    exports: [],
    entryComponents: [
        //InstrumentComponent
    ],
    bootstrap: [PruebasComponent]
})

export class PruebasModule { }