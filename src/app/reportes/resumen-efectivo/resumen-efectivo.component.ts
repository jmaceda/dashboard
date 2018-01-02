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




export var gGetGroupsWithAtms:any;
export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;
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

var nomCompoente = "ResumenDeEfectivo";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './resumen-efectivo.component.html',
    styleUrls  : ['./resumen-efectivo.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService]
})
export class ResumenDeEfectivo implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "G";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;


    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;

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
        //console.log("fchFinParam["+fchFinParam+"]");
        //console.log("date["+d2+"]  ["+d2.getTime()+"]  ["+new Date(d2)+"]");

        let datosParam:any = {fchIni: d1.getTime(), fchFin: d2.getTime(), idGpo: Number(idGpo)};

        //this.obtenGetGroupsWithAtms();

        this.obtenTotalesTienda(datosParam);
    }

    GetStoreTotals(datosTienda:any, status){
        gDatosResumenDeEfectivo = datosTienda;
        console.log(JSON.stringify(datosTienda));
    }

    GetCmByStore(datosTienda:any, status){
        gDatosResumenDeEfectivo = datosTienda;
        //console.log("GetCmByStore:: "+JSON.stringify(datosTienda));
    }

    public insertaDatosUltimoCorte(datosParam) {

        let filtrosDepPorTienda = {
            startDate: datosParam.fchIni,
            endDate: datosParam.fchFin,
            store: datosParam.idGpo
        };

        let ultimoCorte = this.depositosPorTiendaService.obtenUltimoCorte(filtrosDepPorTienda);

        console.log(nomCompoente + ".insertaDatosUltimoCorte:: ultimoCorte[" + JSON.stringify(ultimoCorte) + "]");

        let corteAnterior: any = {
            'tipoOper': 'Depósito Walmart',
            'monto': 0,
            'opers': 0,
            'b20': 0,
            'b50': 0,
            'b100': 0,
            'b200': 0,
            'b500': 0,
            'b1000': 0
        };
    }

    public obtenTotalesTienda(datosParam){

        let parametros:any = {startDate: datosParam.fchIni, endDate: datosParam.fchFin, store: datosParam.idGpo};
        //console.log("TotalesPorTiendaComponent.obtenTotalesTienda:: parametros["+JSON.stringify(parametros)+"]");
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
        let datosEfectivo:any[] = [{}];
        let idx:number = 0;

        let acumDepositos:any   = {'tipoOper': 'Depósito Walmart',   'monto': 0, 'opers': 0, 'b20': 0, 'b50': 0, 'b100': 0, 'b200': 0, 'b500': 0, 'b1000': 0};
        let acumRetiros:any     = {'tipoOper': 'Retiro de Efectivo', 'monto': 0, 'opers': 0, 'b20': 0, 'b50': 0, 'b100': 0, 'b200': 0, 'b500': 0, 'b1000': 0};
        let acumDisponible:any  = {'tipoOper': 'Total Disponible',   'monto': 0, 'opers': 0, 'b20': 0, 'b50': 0, 'b100': 0, 'b200': 0, 'b500': 0, 'b1000': 0};


        //console.log("gDatoResumenDeEfectivo: "+JSON.stringify(gDatosResumenDeEfectivo));
        this.insertaDatosUltimoCorte(datosParam);

        gDatosResumenDeEfectivo.forEach(( reg )=> {
            //console.log("TxType["+reg.TxType+"]")
            if(reg.TxType == "Retiro de Efectivo"){
                acumRetiros.b20   += Number(reg.Amount20);
                acumRetiros.b50   += Number(reg.Amount50);
                acumRetiros.b100  += Number(reg.Amount100);
                acumRetiros.b200  += Number(reg.Amount200);
                acumRetiros.b500  += Number(reg.Amount500);
                acumRetiros.b1000 += Number(reg.Amount1000);
                acumRetiros.monto = Number((acumRetiros.b20 * 20) + (acumRetiros.b50 * 50) + (acumRetiros.b100 * 100)
                                  + (acumRetiros.b200 * 200) + (acumRetiros.b500 * 500) + (acumRetiros.b1000 * 1000));
                acumRetiros.opers++;
                acumDisponible.opers++;

                //console.log("Retiros: "+JSON.stringify(acumRetiros));
            }else if (reg.TxType == "Depósito Walmart"){
                acumDepositos.b20   += Number(reg.Amount20);
                acumDepositos.b50   += Number(reg.Amount50);
                acumDepositos.b100  += Number(reg.Amount100);
                acumDepositos.b200  += Number(reg.Amount200);
                acumDepositos.b500  += Number(reg.Amount500);
                acumDepositos.b1000 += Number(reg.Amount1000);
                acumDepositos.monto = Number((acumDepositos.b20 * 20) + (acumDepositos.b50 * 50) + (acumDepositos.b100 * 100)
                    + (acumDepositos.b200 * 200) + (acumDepositos.b500 * 500) + (acumDepositos.b1000 * 1000));
                acumDepositos.opers++;
                acumDisponible.opers++;
                //console.log("Retiros: "+JSON.stringify(acumDepositos));
            }

            acumDisponible.b20      = Number(acumDepositos.b20) - Number(acumRetiros.b20);
            acumDisponible.b50      = Number(acumDepositos.b50) - Number(acumRetiros.b50);
            acumDisponible.b100     = Number(acumDepositos.b100) - Number(acumRetiros.b100);
            acumDisponible.b200     = Number(acumDepositos.b200) - Number(acumRetiros.b200);
            acumDisponible.b500     = Number(acumDepositos.b500) - Number(acumRetiros.b500);
            acumDisponible.b1000    = Number(acumDepositos.b1000) - Number(acumRetiros.b1000);
            acumDisponible.monto    = Number((acumDisponible.b20 * 20) + (acumDisponible.b50 * 50) + (acumDisponible.b100 * 100)
                + (acumDisponible.b200 * 200) + (acumDisponible.b500 * 500) + (acumDisponible.b1000 * 1000));
            //console.log("Disponible: "+JSON.stringify(acumDisponible));

        });

        //console.log("Depositos: "+JSON.stringify(acumDepositos));
        //console.log("Retiros: "+JSON.stringify(acumRetiros));
        //console.log("Disponible: "+JSON.stringify(acumDisponible));

        acumDepositos.monto     = acumDepositos.monto.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
        acumDepositos.b20       = acumDepositos.b20.toLocaleString("es-MX");
        acumDepositos.b50       = acumDepositos.b50.toLocaleString("es-MX");
        acumDepositos.b100      = acumDepositos.b100.toLocaleString("es-MX");
        acumDepositos.b200      = acumDepositos.b200.toLocaleString("es-MX");
        acumDepositos.b500      = acumDepositos.b500.toLocaleString("es-MX");
        acumDepositos.b1000     = acumDepositos.b1000.toLocaleString("es-MX");

        acumRetiros.monto       = acumRetiros.monto.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
        acumRetiros.b20         = acumRetiros.b20.toLocaleString("es-MX");
        acumRetiros.b50         = acumRetiros.b50.toLocaleString("es-MX");
        acumRetiros.b100        = acumRetiros.b100.toLocaleString("es-MX");
        acumRetiros.b200        = acumRetiros.b200.toLocaleString("es-MX");
        acumRetiros.b500        = acumRetiros.b500.toLocaleString("es-MX");
        acumRetiros.b1000       = acumRetiros.b1000.toLocaleString("es-MX");

        acumDisponible.monto   = acumDisponible.monto.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
        acumDisponible.b20     = acumDisponible.b20.toLocaleString("es-MX");
        acumDisponible.b50     = acumDisponible.b50.toLocaleString("es-MX");
        acumDisponible.b100    = acumDisponible.b100.toLocaleString("es-MX");
        acumDisponible.b200    = acumDisponible.b200.toLocaleString("es-MX");
        acumDisponible.b500    = acumDisponible.b500.toLocaleString("es-MX");
        acumDisponible.b1000   = acumDisponible.b1000.toLocaleString("es-MX");
        
        datosEfectivo = [
            JSON.parse(JSON.stringify(acumDepositos)),
            JSON.parse(JSON.stringify(acumRetiros)),
            JSON.parse(JSON.stringify(acumDisponible))
        ];

        //console.log("ResumenDeEfectivo.obtenTotalesTienda:: datosEfectivo: "+JSON.stringify(datosEfectivo));

        this.itemResource = new DataTableResource(datosEfectivo);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public depositosPorTiendaService: DepositosPorTiendaService){

    }

    gGetGroupsWithAtms: GetGroupsWithAtms[] = gGetGroupsWithAtms;

    ngOnInit() { }

    reloadItems(params) {
        //console.log("reloadItems::  parms: "+JSON.stringify(filtros-consultas));

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