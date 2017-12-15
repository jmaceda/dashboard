// app/reportes/log-hma.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { SoapService }                                  from '../../services/soap.service';
import { sprintf }                                      from "sprintf-js";
import { DataTable }                                    from 'angular-4-data-table-fix';
import { DataTableTranslations }                        from 'angular-4-data-table-fix';
import { DataTableResource }                            from 'angular-4-data-table-fix';
import { Angular2Csv }                                  from 'angular2-csv/Angular2-csv';
//import { RemoteService } from '../../services/remote.service';
//import * as XLSX from 'xlsx';
import { EventEmitter}      from '@angular/core';

//import { ExcelService } from './excel.service';

/*
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

export var gGetGroupsAtmIds:any;

export class GetGroupsAtmIds{
    Id: string;
    Description: string;
    Description2: string;
    Description3: string;

    constructor(Id: string, Description: string, Description2: string, Description3: string){
        this.Id = Id;
        this.Description = Description;
        this.Description2 = Description2;
        this.Description3 = Description3;
    }
}


@Component({
    selector   : 'total_tienda',
    templateUrl: './totales-por-tienda.component.html',
    styleUrls  : ['./totales-por-tienda.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService]
})
export class TotalesPorTiendaComponent implements OnInit  {

    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;

    parametrosConsulta(infoRecibida){
        console.log("Se va mostrar la información enviada desde el componente Params");
        console.log("Params recibidos: ["+JSON.stringify(infoRecibida)+"]");
        console.log("Se mostro la información enviada desde el componente Params");
        let parametrossConsulta:any = {};

        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        let ipParam   = infoRecibida.atm;

        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        console.log(fchIniParam);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);

        console.log(fchFinParam);

        let datosParam:any = {fchIni: fchIniParam, fchFin: fchFinParam, ip: ipParam};

        this.obtenGruposDeATMs();
    }

    constructor(public _soapService: SoapService){

    }

    gGetGroupsAtmIds: GetGroupsAtmIds[] = gGetGroupsAtmIds;

    ngOnInit() {
        this.obtenGruposDeATMs();

    }

    reloadItems(params) {
        console.log("reloadItems::  parms: "+JSON.stringify(params));

        this.itemResource.query(params).then(items => this.items = items);

    }

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }

    GetGroupsAtmsIps(datosGroups:any, status){
        console.log("TotalesPorTiendaComponent.GetGroupsAtmsIps:: ["+JSON.stringify(datosGroups)+"]");
    }

    obtenGetGroupsAtmsIps(){

        let parametros:any = {groupsIds: ['-1']};
        this._soapService.post('', 'GetGroupsAtmsIps', parametros, this.GetGroupsAtmsIps);
    }

    GetGroupsAtmIds(datosGroups:any, status){

        //console.log("TotalesPorTiendaComponent.GetGroupsAtmIds:: ["+JSON.stringify(datosGroups)+"]");
        gGetGroupsAtmIds = [];
        datosGroups.forEach((reg)=> {
            gGetGroupsAtmIds.push({
                Id: reg.Id,
                Description: reg.Description
            });
        })

    }

    obtenGruposDeATMs(){

        this._soapService.post('', 'GetGroup', '', this.GetGroupsAtmIds);

        console.log("TotalesPorTiendaComponent.obtenGruposDeATMs:: ["+JSON.stringify(gGetGroupsAtmIds)+"]");

        this.obtenGetGroupsAtmsIps();
    }
}

function comparar ( a, b ){ return a - b; }