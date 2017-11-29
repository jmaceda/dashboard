// app/reportes/journa2.component.ts
import { Component }             from '@angular/core';
import { OnInit }                from '@angular/core';
import { SoapService }           from '../../services/soap.service';
import { sprintf }               from "sprintf-js";
import {Http}                    from "@angular/http";

/*
import { DataFilterPipe }   from '../../pipes/data-filter.pipe';

var ipAnterior:string = null;
var gFchInicioAnterior = null;
var gFchInicioFinAnterior = null;
var intervalId = null;
var tiempoRefreshDatos:number = (1000 * 30 * 1); // Actualiza la información cada minuto.
var arrDatosJournal:any[] = [];

export var arrDatosServidor:any[]     = [];
export var arrDatosServidorInc:any[]  = [];
export var arrDatosServidorBack:any[] = [];
export var datosATMs  = [];
export var ipATMs  = [];
export var gNumRegsProcesados          = 0;
export var gNumPaginas                 = 0;
export var gNumRegistros               = 0;
export var aDatosJournal               = [];
export var gNumPaginasCompletas = 0;
export var numPagsCompletas:number    = 0;
export var numPaginaObtenida:number   = 0;
*/

@Component({
    selector   : 'app-journal',
    templateUrl: './journal2.component.html',
    styleUrls  : ['./journal2.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService]
})
export class Journal2Component implements OnInit  {

    public data: any[];
    public filterQuery = "";
    public rowsOnPage = 5;
    public sortBy = "email";
    public sortOrder = "asc";

    constructor(private _http: Http) { }

    ngOnInit(): void {

        this._http.get("assets/data.json")
            .subscribe((data)=> {
                setTimeout(()=> {
                    this.data = data.json();
                }, 2000);
            });

    }

}

function comparar ( a, b ){ return a - b; }