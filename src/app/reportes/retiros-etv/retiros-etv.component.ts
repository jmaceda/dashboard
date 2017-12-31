// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { EventEmitter}                                  from '@angular/core';

import { sprintf }                                      from "sprintf-js";
import { DataTable }                                    from 'angular-4-data-table-fix';
import { DataTableTranslations }                        from 'angular-4-data-table-fix';
import { DataTableResource }                            from 'angular-4-data-table-fix';

import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { DepositosPorTiendaService }                    from '../../services/acumulado-por-deposito.service';
import { UtilsService }                                 from '../../services/utils.service';




export var gPaginasJournal:any;
export var gDatosCortesEtv:any;

export var gGetGroupsWithAtms:any;
//export var gGetGroupsAtmsIps:any;
//export var gGetAtmDetail:any;
//export var gDatosGpoActual:any;
//export var gGrupos:any;
export var gDatosResumenDeEfectivo:any;


export class GetAtmDetail{
    Id: string;
    Description: string;
    Ip: string;
    Name: string;
    groupId: number;

    constructor(Id: string, Description: string, Ip: string, Name: string, groupId: number){
        this.Id = Id;
        this.Description = Description;
        this.Ip = Ip;
        this.Name = Name;
        this.groupId = groupId;
    }
}

export class GetGroupsAtmsIps{
    IdAtms: string;

    constructor(IdAtms: string){
        this.IdAtms = IdAtms;
    }
}

export class GetGroupsWithAtms{
    Id: string;
    Description: string;
    Description2: string;

    constructor(Id: string, Description: string, Description2: string){
        this.Id = Id;
        this.Description = Description;
        this.Description2 = Description2;
    }
}

var nomComponente = "RetirosEtvComponent";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './retiros-etv.component.html',
    styleUrls  : ['./retiros-etv.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, UtilsService]
})
export class RetirosEtvComponent implements OnInit  {

    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;

    public dListaAtmGpos:any = [];
    public dTipoListaParams:string = "A";
    public dUltimaActualizacion:string;
    public regsLimite:number = 15;

    public parametrosConsulta(infoRecibida){
        console.log("Se va mostrar la información enviada desde el componente Params");
        console.log("Params recibidos: ["+JSON.stringify(infoRecibida)+"]");
        console.log("Se mostro la información enviada desde el componente Params");
        let parametrossConsulta:any = {};

        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        let idGpo     = infoRecibida.gpo;
        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let d1 = new Date(Number(fIniParam.year), Number(fIniParam.month)-1, Number(fIniParam.day));

        console.log("fchIniParam["+fchIniParam+"]");
        console.log("date["+d1+"]  ["+d1.getTime()+"]  ["+new Date(d1)+"]");

        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let d2= new Date(Number(fFinParam.year), Number(fFinParam.month)-1, Number(fFinParam.day)+1);
        let datosParam:any = {fchIni: d1.getTime(), fchFin: d2.getTime(), idGpo: Number(idGpo)};

        this.obtenDatosDeCortesEtv(datosParam);
    }

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
        // TotalItems / TotalPages
        console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
    }

    public GetEjaLogPage(datosCortesEtv:any, status){
        gDatosCortesEtv = datosCortesEtv;
    }

    public arrDatosCortesEtv:any;

    public obtenDatosDeCortesEtv(datosParam) {

        let parametros: any = {
            ip: ["11.40.2.8"], timeStampStart: "2017-12-24-00-00", timeStampEnd: "2017-12-30-23-59",
            events: ["Administrative"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        console.log(nomComponente + ".obtenDatosDeCortesEtv:: [" + JSON.stringify(parametros) + "]");
        this._soapService.post('', 'GetEjaLogDataLength', parametros, this.GetEjaLogDataLength);

        let datosCortesEtv:any = [];

        this.arrDatosCortesEtv = [];

        for(let idx=0; idx < gPaginasJournal.TotalPages; idx++) {
            parametros = {
                ip: ["11.40.2.8"], timeStampStart: "2017-12-24-00-00", timeStampEnd: "2017-12-30-23-59",
                events: ["Administrative"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
            };

            this._soapService.post('', 'GetEjaLogPage', parametros, this.GetEjaLogPage);

            datosCortesEtv = datosCortesEtv.concat(gDatosCortesEtv);
        }

        console.log(nomComponente + ".obtenDatosDeCortesEtv:: [" + JSON.stringify(datosCortesEtv) + "]");

        datosCortesEtv.forEach( (reg) => {
            let data = (reg.Data).substring(41).replace(/\]\[/g, ' ').replace(/[\[\]]/g,' ');

            let billOK      = data.split(" ")[0];
            let billRech    = data.split(" ")[1];
            let totalRetiro = data.split(" ")[2];
            let billTot:any = {};

            billOK      = this.utilsService.convBillToJson(billOK, "DC");  // "DC" indica formato billetes: <Denominación>x<Contador>
            billRech    = this.utilsService.convBillToJson(billRech, "DC");
            billTot     = {b20: (billOK.b20 + billRech.b20), b50: (billOK.b50 + billRech.b50), b100: (billOK.b100 + billRech.b100), b200: (billOK.b200 + billRech.b200), b500: (billOK.b500 + billRech.b500), b1000: (billOK.b1000 + billRech.b1000), monto: (billOK.monto + billRech.monto)}

            this.arrDatosCortesEtv.push({TimeStamp: reg.TimeStamp, Ip: reg.Ip, AtmName: reg.AtmName, Amount: reg.Amount, billOK: billOK, billRech: billRech, billTot: billTot})
        });

        console.log(JSON.stringify(this.arrDatosCortesEtv));

        this.filtrosUtilsService.fchaHraUltimaActualizacion();

        this.itemResource = new DataTableResource(this.arrDatosCortesEtv);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});
    }

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public utilsService: UtilsService){

    }

    gGetGroupsWithAtms: GetGroupsWithAtms[] = gGetGroupsWithAtms;

    public ngOnInit() {
    }

    reloadItems(params) {
        //console.log("reloadItems::  parms: "+JSON.stringify(params));

        this.itemResource.query(params).then(items => this.items = items);

    }

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }

}

function comparar ( a, b ){ return a - b; }