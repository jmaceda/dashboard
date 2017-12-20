// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { SoapService }                                  from '../../services/soap.service';
import { sprintf }                                      from "sprintf-js";
import { DataTable }                                    from 'angular-4-data-table-fix';
import { DataTableTranslations }                        from 'angular-4-data-table-fix';
import { DataTableResource }                            from 'angular-4-data-table-fix';
//import { Angular2Csv }                                  from 'angular2-csv/Angular2-csv';
import { EventEmitter}      from '@angular/core';

//import { ParamsAtmsComponent }                          from '../params-atms/params-atms.component';


export var gGetGroupsWithAtms:any;
export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;
export var gDatosTotalPorTienda:any;


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



@Component({
    selector   : 'detalle-tienda',
    templateUrl: './detalle-por-tienda.component.html',
    styleUrls  : ['./detalle-por-tienda.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService]
})
export class DetallePorTienda implements OnInit  {

    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;

    public dListaAtmGpos:any = [];
    public dTipoListaParams:string = "G";
    public dUltimaActualizacion:string;
    public regsLimite:number = 15;


    parametrosConsulta(infoRecibida){
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
        console.log("fchFinParam["+fchFinParam+"]");
        console.log("date["+d2+"]  ["+d2.getTime()+"]  ["+new Date(d2)+"]");

        let datosParam:any = {fchIni: d1.getTime(), fchFin: d2.getTime(), idGpo: Number(idGpo)};

        //this.obtenGetGroupsWithAtms();
        this.obtenTotalesTienda(datosParam);
    }

    GetStoreTotals(datosTienda:any, status){
        gDatosTotalPorTienda = datosTienda;
        console.log(JSON.stringify(datosTienda));
    }

    GetCmByStore(datosTienda:any, status){
        gDatosTotalPorTienda = datosTienda;
        console.log("GetCmByStore:: "+JSON.stringify(datosTienda));
    }

    obtenTotalesTienda(datosParam){

        let parametros:any = {startDate: datosParam.fchIni, endDate: datosParam.fchFin, store: datosParam.idGpo};
        console.log("TotalesPorTiendaComponent.obtenTotalesTienda:: parametros["+JSON.stringify(parametros)+"]");
        //parametros = {startDate: 1513576800000, endDate: 1513749600000, store: 41684324}
        //this._soapService.post('', 'GetStoreTotals', parametros, this.GetStoreTotals);
        this._soapService.post('', 'GetCmByStore', parametros, this.GetCmByStore);

        // <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><GetStoreTotals xmlns="http://Pentomino.mx/"><startDate>1513576800000</startDate><endDate>1513663200000</endDate><store>16228090</store></GetStoreTotals></s:Body></s:Envelope>

        //  <?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetStoreTotalsResponse xmlns="http://Pentomino.mx/"><GetStoreTotalsResult><CmStoreInfo><Store>Tienda 3805</Store><User /><Atm>CI01GT0003</Atm><TxType>Depósito Walmart</TxType><Date>Pendiente ATM CI01GT0003</Date><Time /><TxId>92</TxId><Amount1000>22</Amount1000><Amount500>1486</Amount500><Amount200>842</Amount200><Amount100>504</Amount100><Amount50>228</Amount50><Amount20>2</Amount20><Dispensed1000>0</Dispensed1000><Dispensed500>51</Dispensed500><Dispensed200>0</Dispensed200><Dispensed100>0</Dispensed100><Dispensed50>0</Dispensed50><Dispensed20>0</Dispensed20><Taken1000>22</Taken1000><Taken500>1435</Taken500><Taken200>842</Taken200><Taken100>504</Taken100><Taken50>228</Taken50><Taken20>2</Taken20><Total>885690</Total></CmStoreInfo></GetStoreTotalsResult></GetStoreTotalsResponse></soap:Body></soap:Envelope>
        
        /*
        {"Store":"Tienda 3805","User":null,"Atm":"CI01GT0003","TxType":"Depósito Walmart","Date":"Pendiente ATM CI01GT0003","Time":null,"TxId":"92",
        "Amount1000":22,"Amount500":1486,"Amount200":842,"Amount100":504,"Amount50":228,"Amount20":2,
        "Dispensed1000":0,"Dispensed500":51,"Dispensed200":0,"Dispensed100":0,"Dispensed50":0,"Dispensed20":0,
        "Taken1000":22,"Taken500":1435,"Taken200":842,"Taken100":504,"Taken50":228,"Taken20":2,
        "Total":885690}
        */
        let arrDatosAtms:any[] = [];
        let idx:number = 0;
        gDatosTotalPorTienda.forEach(( reg )=> {
            arrDatosAtms[idx++] = {
                Store:      reg.Store,
                Atm:        reg.Atm,
                TxType:     reg.TxType,
                Date:       reg.Date,
                Amount1000: reg.Amount1000,
                Amount500:  reg.Amount500,
                Amount200:  reg.Amount200,
                Amount100:  reg.Amount100,
                Amount50:   reg.Amount50,
                Amount20:   reg.Amount20,

                Dispensed1000: reg.Dispensed1000,
                Dispensed500:  reg.Dispensed500,
                Dispensed200:  reg.Dispensed200,
                Dispensed100:  reg.Dispensed100,
                Dispensed50:   reg.Dispensed50,
                Dispensed20:   reg.Dispensed20,

                Taken1000: reg.Taken1000,
                Taken500:  reg.Taken500,
                Taken200:  reg.Taken200,
                Taken100:  reg.Taken100,
                Taken50:   reg.Taken50,
                Taken20:   reg.Taken20,
            }
        });

        this.itemResource = new DataTableResource(arrDatosAtms);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.dUltimaActualizacion = sprintf('%4d-%02d-%02d      %02d:%02d:%02d', _anioSys, _mesSys, _diaSys, _hraSys, _minSys, _segSys);
        $("#idFchHraUltimaActual").val(this.dUltimaActualizacion);
    }

    constructor(public _soapService: SoapService){}

    gGetGroupsWithAtms: GetGroupsWithAtms[] = gGetGroupsWithAtms;

    ngOnInit() {
        //this.obtenGetGroupsWithAtms();
        //this.dListaAtmGpos = gGrupos;

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

}

function comparar ( a, b ){ return a - b; }