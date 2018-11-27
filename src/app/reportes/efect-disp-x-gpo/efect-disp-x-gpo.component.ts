// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';

import { sprintf }                                      from "sprintf-js";
import { DataTableResource }                            from 'angular-4-data-table-fix';

import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { DepositosPorTiendaService }                    from '../../services/acumulado-por-deposito.service';
import { DatosJournalService }                          from '../../services/datos-journal.service';
import { UtilsService }                                 from '../../services/utils.service';
import { LogHmaService }                                from '../../services/log-hma.service';


import { AcumulaBilletesModel }                         from '../../models/acumula-billetes.model';

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-style';

import { SweetAlertService } from 'ngx-sweetalert2';
import {InfoAtmsService} from "../../services/info-atms.service";

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;
export var gDatosResumenDeEfectivo:any;

export var gPaginasHMA:any;
export var gdatosHMA:any;
export var gPaginasJoural:any[] = [];
//export var gDatosJoural:any[] = [];
export var gCatalogoEventos:any[]       = [];
export var gDevicesAtm:any[]            = [];

export var gPaginasJournal:any;
export var gDatosJournal:any;

var nomComponente = "EfectDispXAtmCoponent";

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
    templateUrl: './efect-disp-x-gpo.component.html',
    styleUrls  : ['./efect-disp-x-gpo.component.css'],
    providers: [SoapService, InfoAtmsService, DepositosPorTiendaService, DatosJournalService, UtilsService, LogHmaService, SweetAlertService]
})
export class EfectDispXGpoCoponent implements OnInit {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos: any = [];
    public dTipoListaParams: string = "G";
    public dSolicitaFechasIni = true;
    public dSolicitaFechasFin = false;
    public dUltimaActualizacion: string;
    public fchUltimaActualizacion:any = null;

    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;
    public arrDatosRetirosHMA:any;
    public datosUltimoCorte:any;
    public billetesDepositados : AcumulaBilletesModel    = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public billetesRetirados : AcumulaBilletesModel      = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public arrBilletesDisponibles : AcumulaBilletesModel[] = [];

    private selected                 = [];
    /* ngx-datatable */
    private datosTienda:any          = [];
    private tituloDatatable:string   = "Efectivo Disponible";
    private loadingIndicator:boolean = false;
    private numDepositos             = 0;
    private numRetiros               = 0;
    private colsEfectDisp            = [
        {prop: '#',              name: '#'},
        {prop: 'tienda',         name: 'Tienda'},
        {prop: 'id',             name: 'ID'},
        {prop: 'ip',             name: 'IP'},
        {prop: 'fchUltimoCorte', name: 'Fecha último corte'},
        {prop: 'origen',         name: 'Origen'},
        {prop: 'b20',            name: '$20'},
        {prop: 'b50',            name: '$50'},
        {prop: 'b100',           name: '$100'},
        {prop: 'b200',           name: '$200'},
        {prop: 'b500',           name: '$500'},
        {prop: 'b1000',          name: '$1000'},
        {prop: 'monto',          name: 'Monto'},
    ];
    private numTiendas:number        = 0;

    private billCasetesRecicla:any  = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };
    private billCasetesRechazos:any = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };
    private billDisponibles:any     = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };
    private atmName:string = "";
    private ipAtm:string   = "";
    private descAtm:string = "";
    private origenDisponible = "Disponible";
	private isDatosEfecDisp:boolean      = false;

    public listaDatosEfectivo: any[] = [];

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public depositosPorTiendaService: DepositosPorTiendaService,
                public datosJournalService: DatosJournalService,
                public utilsService: UtilsService,
                public logHmaService: LogHmaService,
                public infoAtmsService: InfoAtmsService,
                private _swal2: SweetAlertService){
        console.log("EfectDispXAtmCoponent.constructor()");
    }

    ngOnInit() {
        this.arrBilletesDisponibles.push(new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0));
        gDevicesAtm         = this.logHmaService.GetHmaDevices();
        gCatalogoEventos    = this.logHmaService.obtenEventos();
    }


    public parametrosConsulta(infoRecibida) {

        this.fchUltimaActualizacion = null;

        let idGpo 	    = infoRecibida.gpo;
        let fIniParam   = infoRecibida.fchInicio;
        let fFinParam   = infoRecibida.fchFin;
        let ipAtm       = infoRecibida.gpo;
        let descAtm     = infoRecibida.descAtm;
        let fchIniParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let datosParam: any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm, descAtm: descAtm};
        let paramsConsulta:any      = {
            'timeStampStart': fchIniParam,
            'timeStampEnd': fchFinParam,
            'idGpo': idGpo
        };

        this.obtenDatosDeEfectivo(paramsConsulta);
    }


    public obtenDatosDeEfectivo(filtrosCons:any) {

        let f1 = new Date();
        let filtrosConsMovtos:any           = JSON.stringify(filtrosCons);
        let opc2                            = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
        let opc3                            = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};

        let datosCortesJournal:any          = [];
        let billetesDisponibles: any        = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
        let ultimoCorte:any                 = [];
        let fchUltimoCorte:any              = Date();
        let montoUltimoCorte:any            = "";
        let fchUltimoCorte1:any             = "";
        let fchUltimoCorte2:any             = "";
        let fchUltimoCorte3:any             = "";
        let fchUltimoCorte4:any             = "";
        let fchUltimoCorte5:any             = "";
        let fchUltimoCorte6:any             = "";
        let idAtms:any[]        	        = this.infoAtmsService.obtenInfoAtmsOnLinePorGpo(filtrosCons);

        this.listaDatosEfectivo             = [];


        if(idAtms != null){
            idAtms.forEach( (reg) => {
                filtrosCons.ipAtm       = reg.Ip;
                filtrosCons["tienda"]   = reg.Description
                filtrosConsMovtos       = JSON.stringify(filtrosCons);
                billetesDisponibles     = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
                datosCortesJournal      = this.datosJournalService.obtenCortesJournal(filtrosCons);
                ultimoCorte             = datosCortesJournal[datosCortesJournal.length -1];
                this.descAtm            = reg.Description;
                this.atmName            = reg.Name;
                this.ipAtm              = reg.Ip;

                if (ultimoCorte != undefined || ultimoCorte != null) {

                    this.numTiendas++;
                    fchUltimoCorte = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, opc2);
                    fchUltimoCorte4 = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, opc3);
                    montoUltimoCorte = ultimoCorte.Amount.toLocaleString("es-MX", {style: "currency", currency: "MXN"});
                    fchUltimoCorte1 = fchUltimoCorte.replace(/[\/ :]/g, "-").split("-");
                    fchUltimoCorte2 = sprintf("%4d-%02d-%02d-%02d-%02d", fchUltimoCorte1[2], fchUltimoCorte1[1], fchUltimoCorte1[0], fchUltimoCorte1[3], fchUltimoCorte1[4]);
                    fchUltimoCorte3 = sprintf("%02d/%02d/%4d  %02d:%02d", fchUltimoCorte1[0], fchUltimoCorte1[1], fchUltimoCorte1[2], fchUltimoCorte1[3], fchUltimoCorte1[4]);
                    //fchUltimoCorte5 = fchUltimoCorte4.split(" ");
                    //fchUltimoCorte6 = sprintf("%s", fchUltimoCorte5[0], fchUltimoCorte5[1], fchUltimoCorte5[2], fchUltimoCorte5[3], fchUltimoCorte5[4], fchUltimoCorte5[5]);

                    this.datosTienda[reg.Ip] = {"tienda": filtrosCons.tienda, "id": reg.Id, "ip": reg.Ip, numDepositos: 0, numRetiros: 0, fchUltimoCorte: fchUltimoCorte4};

                    console.log(JSON.stringify(this.datosTienda[reg.Ip]));
                    filtrosCons = JSON.parse(filtrosConsMovtos);
                    filtrosCons.timeStampStart = fchUltimoCorte2;

                    //this.datosUltimoCorte       = sprintf("%02d-%02d-%4d-%02d-%02d", fchUltimoCorte1[0], fchUltimoCorte1[1], fchUltimoCorte1[2], fchUltimoCorte1[3], fchUltimoCorte1[4]);
                    this.datosUltimoCorte = new Date(ultimoCorte.TimeStamp).toLocaleDateString('es', opc3);

                    // Depositos Journal
                    this.billetesDepositados = this.infoDepositosJournal(filtrosCons);
                    this.billetesDepositados = this.datosComplementarios(this.billetesDepositados, "Depósitos", this.descAtm, this.atmName, this.ipAtm, this.datosUltimoCorte);
                    //console.log("Depositos:  " + JSON.stringify(this.billetesDepositados));

                    // Retiros HMA
                    this.billetesRetirados = this.infoRetirosHMA(filtrosCons);
                    this.billetesRetirados = this.datosComplementarios(this.billetesRetirados, "Retiros", this.descAtm, this.atmName, this.ipAtm, this.datosUltimoCorte);
                    //console.log("Retiros:    " + JSON.stringify(this.billetesRetirados));

                    // Ingreso a Casete Reciclaje
                    let billCaseterosReciclados: any = this.infoFullStatus(filtrosCons);
                    billCaseterosReciclados = this.datosComplementarios(billCaseterosReciclados, "Billetes ingresados a casetes reciclaje", this.descAtm, this.atmName, this.ipAtm, this.datosUltimoCorte);
                    console.log("FullStatus: <<" + JSON.stringify(billCaseterosReciclados) + ">>");


                    // Ingreso a Casete Rechazos
                    let billCaseterosRechazos: any = this.infoCashUnitStatus(filtrosCons);
                    billCaseterosRechazos = this.datosComplementarios(billCaseterosRechazos, "Billetes ingresados en casete rechazo", this.descAtm, this.atmName, this.ipAtm, this.datosUltimoCorte);
                    //console.log("CashUnitStatus: <<" + JSON.stringify(billCaseterosRechazos) + ">>");

                    // Calcula número de billetes Rechazados.
                    this.billCasetesRechazos = this.calculaRechazos(this.billetesDepositados, billCaseterosReciclados, billCaseterosRechazos);
                    this.billCasetesRechazos = this.datosComplementarios(this.billCasetesRechazos, "Billetes ingresados en casete rechazo", this.descAtm, this.atmName, this.ipAtm, this.datosUltimoCorte);

                    // Billetes Disponibles
                    this.arrBilletesDisponibles = this.calcBillDisponible(this.billetesDepositados, billCaseterosReciclados, this.billCasetesRechazos, this.billetesRetirados);
                    this.arrBilletesDisponibles = this.datosComplementarios(this.arrBilletesDisponibles, this.origenDisponible, this.descAtm, this.atmName, this.ipAtm, this.datosUltimoCorte);

                    //console.log("billDisponibles: <<" + JSON.stringify(this.billDisponibles) + ">>");

                    this.listaDatosEfectivo.push(this.billetesDepositados);
                    this.listaDatosEfectivo.push(billCaseterosReciclados);
                    this.listaDatosEfectivo.push(this.billCasetesRechazos);
                    this.listaDatosEfectivo.push(this.billetesRetirados);
                    this.listaDatosEfectivo.push(this.arrBilletesDisponibles);
                    //console.log("listaDatosEfectivo: <<" + JSON.stringify(this.listaDatosEfectivo) + ">>");
                }
            });
			
			if (this.listaDatosEfectivo.length > 0) {
				$('#btnExpExel2').css('cursor', 'pointer');
				this.isDatosEfecDisp = !this.isDatosEfecDisp;
			}else{
				$('#btnExpExel2').css('cursor', 'not-allowed');
				this.isDatosEfecDisp = this.isDatosEfecDisp;
			}
        }

        this.fchUltimaActualizacion = this.filtrosUtilsService.fchaHraUltimaActualizacion();

        let f2 = new Date();
        console.log("Duración: " + this.utilsService.calculaTiempoDuracion(f1, f2));
    }

private datos:any = [];

    private datosComplementarios(datosBill, descOrigen, tienda, id, ip, fchUltimoCorte?){

        let varTmp:any = {};

        varTmp["tienda"]          = tienda;
        varTmp["id"]              = id;
        varTmp["ip"]              = ip;
        varTmp["fchUltimoCorte"]  = fchUltimoCorte;
        varTmp["origen"]          = descOrigen;
        varTmp["b20"]             = datosBill.b20;
        varTmp["b50"]             = datosBill.b50;
        varTmp["b100"]            = datosBill.b100;
        varTmp["b200"]            = datosBill.b200;
        varTmp["b500"]            = datosBill.b500;
        varTmp["b1000"]           = datosBill.b1000;
        varTmp["monto"]           = datosBill.monto;

        return(varTmp);
    }

    private calcBillDisponible(billDepositados, billReciclados, billRechazos, billRetirados){

        let billDisponibles:any = {opers: 0, b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, monto: 0};
        billDisponibles.opers   = 0;
        billDisponibles.b20     = billDepositados.b20   - (billRechazos.b20 + billRetirados.b20);
        billDisponibles.b50     = billDepositados.b50   - (billRechazos.b50 + billRetirados.b50);
        billDisponibles.b100    = billDepositados.b100  - (billRechazos.b100 + billRetirados.b100);
        billDisponibles.b200    = billDepositados.b200  - (billRechazos.b200 + billRetirados.b200);
        billDisponibles.b500    = billDepositados.b500  - (billRechazos.b500 + billRetirados.b500);
        billDisponibles.b1000   = billDepositados.b1000 - (billRechazos.b1000 + billRetirados.b1000);
        billDisponibles.monto   = billDepositados.monto - (billRechazos.monto + billRetirados.monto);

        return(billDisponibles);
    }

    private calcBillDisponible2(billDepositados, billRetirados){

        let billDisponibles:any = {opers: 0, b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, monto: 0};
        billDisponibles.opers   = billDepositados.opers + billRetirados.opers;
        billDisponibles.b20     = billDepositados.b20   - billRetirados.b20;
        billDisponibles.b50     = billDepositados.b50   - billRetirados.b50;
        billDisponibles.b100    = billDepositados.b100  - billRetirados.b100;
        billDisponibles.b200    = billDepositados.b200  - billRetirados.b200;
        billDisponibles.b500    = billDepositados.b500  - billRetirados.b500;
        billDisponibles.b1000   = billDepositados.b1000 - billRetirados.b1000;
        billDisponibles.monto   = billDepositados.monto - billRetirados.monto;

        return(billDisponibles);
    }

    
    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
    }

    public GetEjaLogPage(datosCortesJournal:any, status){
        gDatosJournal = datosCortesJournal;
    }

    public infoDepositosJournal(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
        let paramsCons:any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["CashManagement"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength, false);

        if (gPaginasJournal.TotalPages > 0) {
            let datosJournal: any = [];

            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage, false);
                datosJournal = datosJournal.concat(gDatosJournal);
            }

            let arrBilletesJournal: any[] = [];
            let idx:number                = 0;
            let numOpers:number           = 0;
            let Id:number                 = 0;
            let Ip:string                 = "";

            this.numDepositos         = 0;

            datosJournal.forEach((reg) => {
                if (reg.SwitchResponseCode == 0) {
                    idx = reg.Data.indexOf("[");
                    arrBilletesJournal.push(reg.Data.substring(idx));
                    this.numDepositos++;
                    Id = reg.Id;
                    Ip = reg.Ip;
                }
            });

            //this.datosTienda[Ip] = {"tienda": filtrosCons.tienda, "id": Id, "ip": Ip, numDepositos: this.numDepositos, numRetiros: 0};
            this.datosTienda[Ip].numDepositos = this.numDepositos;

            numBilletes = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesJournal, "|", "BD");
        }

        return(numBilletes);
    }


    GetHmaLogPage(datosHMA:any, status){
        gdatosHMA = datosHMA;
    }

    GetHmaLogDataLength(paginasHMA:any, status){
        gPaginasHMA = paginasHMA;
    }

    public infoRetirosHMA(filtrosCons) {

        let numBilletes:any = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["ICM", "AFD"],
            events: ["ARQCGenerationOk", "DenominateInfo", "PresentOk"]
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                datosRetirosHMA = datosRetirosHMA.concat(gdatosHMA);
            }

            let arrBilletesRetiro: any[] = [];
            let arrBilletesDeposito: any[] = [];
            let cveCat;
            let billetesRetiro:string = "";
            let billetesDeposito:string = "";

            let infoDenominateInfo:any = "";
            let infoARQCGenerationOk:boolean = false;
            let numOpers:number = 0;

            this.numRetiros = 0;

            datosRetirosHMA.forEach(reg => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];

                switch (reg.Events){
                    case "ARQCGenerationOk":
                        infoARQCGenerationOk = true;
                        break;
                    case "DenominateInfo":
                        infoDenominateInfo = (reg.Data + ";");
                        break;
                    case "NotesValidated":
                        //billetesDeposito = reg.Data;
                        break;
                    case "PresentOk":
                        arrBilletesRetiro.push(infoDenominateInfo);
                        infoDenominateInfo = "";
                        this.datosTienda[reg.Ip].numRetiros++;
                        break;
                }
            });

            numBilletes = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRetiro, ";", "BD");
            //this.numRetiros    = numOpers;

        }

        return(numBilletes);
    }

    private calculaRechazos(billetesDepositados, billCaseterosReciclado, billCaseteroRechazos){
        let billCasetesRechazos:any = {};
        
        billCasetesRechazos.b20     = billetesDepositados.b20;
        billCasetesRechazos.b50     = (billetesDepositados.b50  - billCaseterosReciclado.b50) + billCaseteroRechazos.b50;
        billCasetesRechazos.b100    = (billetesDepositados.b100 - billCaseterosReciclado.b100) + billCaseteroRechazos.b100;
        billCasetesRechazos.b200    = (billetesDepositados.b200 - billCaseterosReciclado.b200) + billCaseteroRechazos.b200;
        billCasetesRechazos.b500    = (billetesDepositados.b500 - billCaseterosReciclado.b500) + billCaseteroRechazos.b500;

        billCasetesRechazos.b1000   = billetesDepositados.b1000;
        billCasetesRechazos.monto   = billCasetesRechazos.b20 + billCasetesRechazos.b50 + billCasetesRechazos.b100 +
                                      billCasetesRechazos.b200 + billCasetesRechazos.b500 + billCasetesRechazos.b1000;
        return(billCasetesRechazos);
    }

    public infoFullStatus(filtrosCons) {

        let billCasetesRecicla:any = {};
        let paramsCons: any     = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["FullStatus"]
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosBilletesHMA: any = [];

            for (let idx = (gPaginasHMA.TotalPages -1); gPaginasHMA.TotalPages > idx; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                datosBilletesHMA = gdatosHMA[gdatosHMA.length -1];
            }

            let ftoFecha:any   = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
            let tmpFchHora:any = new Date(datosBilletesHMA.TimeStamp).toLocaleString(undefined, ftoFecha);
            let idx=0;
            let cntBill:any;
            let billAct = 0;
            let billIng = 0;
            billCasetesRecicla = {"FchHra": tmpFchHora, "Cnt": [ [0,0], [0,0], [0,0], [0,0] ],"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };
            billCasetesRecicla = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };

            datosBilletesHMA.Data.split("%").forEach( reg => {
                cntBill = reg.split("-");
                switch (idx++){
                    case 0: billCasetesRecicla.b50 = parseInt(cntBill[3]);
                    case 1: billCasetesRecicla.b100 = parseInt(cntBill[3]);
                    case 2: billCasetesRecicla.b200 = parseInt(cntBill[3]);
                    case 3: billCasetesRecicla.b500 = parseInt(cntBill[3]);
                }
                billIng += parseInt(cntBill[3]);
            });

            billCasetesRecicla.monto  = billIng;
        }

        return(billCasetesRecicla);
    }

    // CashUnitStatus(DEP): 3-OK-11;4-OK-0;5-OK-3;6-OK-0
    public infoCashUnitStatus(filtrosCons) {

        let datosCashUnitStatus:any = {};
        let paramsCons: any         = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["CashUnitStatus"]
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let billetesRechazos: any = [];

            for (let idx = (gPaginasHMA.TotalPages -1); gPaginasHMA.TotalPages > idx; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                billetesRechazos = gdatosHMA[gdatosHMA.length -1];
            }

            let ftoFecha:any    = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
            let tmpFchHora:any  = new Date(billetesRechazos.TimeStamp).toLocaleString(undefined, ftoFecha);
            let idx      = 0;
            let billRech = 0;
            let cntBill:any;

            datosCashUnitStatus = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };

            billetesRechazos.Data.split(";").forEach( reg => {
                cntBill = reg.split("-");
                switch (idx++){
                    case 0: datosCashUnitStatus.b50 = parseInt(cntBill[2]);
                    case 1: datosCashUnitStatus.b100 = parseInt(cntBill[2]);
                    case 2: datosCashUnitStatus.b200 = parseInt(cntBill[2]);
                    case 3: datosCashUnitStatus.b500 = parseInt(cntBill[2]);
                }
                billRech += parseInt(cntBill[2]);
            });

            datosCashUnitStatus.monto  = billRech;
        }

        return(datosCashUnitStatus);
    }

    private exportaEfectivo2Excel() {

        let montos = this.billetesDepositados.monto + this.billetesRetirados.monto + this.billCasetesRecicla.totBill + this.billCasetesRechazos.totBill;
        if (montos == 0){
            console.log("No hay datos");
            this._swal2.info({
                title: "No existen datos para ser exportados a Excel"
            });
        } else {
            this.exportAsExcelFile();
        }
    }

    
    
    
    public exportAsExcelFile(): void {

        let colWidth = [
            {wch: 30},
            {wch: 8},
            {wch: 12},
            {wch: 12},
            {wch: 12},
            {wch: 12},
            {wch: 12},
            {wch: 12},
            {wch: 15}
        ];

        let ws_name = "SheetJS";
        let excelFileName = "prueba";

        /* Crea un nuevo libro */
        let wb = XLSX.utils.book_new();

        /* convert table 'tblDatosPrueba' to worksheet named "Sheet1" */
        /* Carga el contenido de la tabla "tablaPrincipal" (html) a memoria para ser personalizada y exportada */
        let ws = XLSX.utils.table_to_sheet(document.getElementById('tablaPrincipal'));

        /* Agrega una nueva hoja en el libro */
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");


        /* Indica el rango de celdas que serán consideradas en el cache */
        ws['!ref'] = "A1:J50";
        /*
        for (let key in ws) {
            console.log(JSON.stringify(key));
            if (key[0] === '!') continue;

            ws[key].s = {
                border: {
                    top:    {style: "thin", color: {auto: 1}},
                    bottom: {style: "thin", color: {auto: 1}},
                    left:   {style: "thin", color: {auto: 1}},
                    right:  {style: "thin", color: {auto: 1}}
                }
            }
        };
        */


        /* Indica el ancho de cada columna */
        ws['!cols'] = colWidth;

        /* Pinta el borde en la primera sección */
        for (let numCol = 0; numCol < 9; numCol++){
            for (let numReng = 2; numReng < 5; numReng++) {
                this.ponBorder(ws, numCol, numReng, '000000');
            }
        }

        /* Pinta el borde en la segunda sección */
        for (let numCol = 0; numCol < 9; numCol++){
            for (let numReng = 7; numReng < 9; numReng++) {
                this.ponBorder(ws, numCol, numReng, '000000');
            }
        }

        /* Formato númerico con separador (coma) */
        for(let numCol=2; numCol < 8; numCol++) {
            this.setFtoNum(ws, numCol, 2, "#,##0");
        }

        /* Formato númerico con signo de peso y separador (coma) en la columna Monto*/
        for(let numReng=2; numReng < 5; numReng++) {
            this.setFtoNum(ws, 8, numReng, "$#,##0");
        }

        /* Formato númerico con signo de peso y separador (coma) en los encabezados de las dos secciones */
        for(let numCol=2; numCol < 8; numCol++) {
            this.setFtoNum(ws, numCol, 1, "$#,##0");
            this.setFtoNum(ws, numCol, 6, "$#,##0");
        }

        /* Pone color de fondo en las lineas de titulos */
        for(let numCol=0; numCol < 9; numCol++){
            this.colorCelda(ws, numCol, 0, '002060', 'FFFFFF', false, '10pc');
            this.colorCelda(ws, numCol, 1, '0070C0', 'FFFFFF', false, '10pc');
            this.colorCelda(ws, numCol, 6, '0070C0', 'FFFFFF', false, '10pc');

        }

        /* Pone letras bold al renglon de Totales Disponible */
        for(let numCol=0; numCol < 9; numCol++) {
            //this.ponNegritas(ws, numCol, 4, true);
        }

        for(let numCol=1; numCol < 9; numCol++) {
            this.alineaTexto(ws, numCol, 1, "horizontal","right");
            this.alineaTexto(ws, numCol, 6, "horizontal","right");
        }

        this.ponFont(ws, 0, 9, "sz", 9);

/*
        ws['A5'].s = {border: {
            top: { style: "thin", color: { auto: 1} }
        }};
        */

        //let range = {s:{r: 0, c: 0}, e: {r: 4, c: 8}};
        //ws['!ref'] = XLSX.utils.encode_range(range);
/*
var cell_ref = XLSX.utils.encode_cell({c:0,r:7});
var cell = {s:
            { patternType: 'solid',
            fgColor: { rgb: 'FF7F27' },
            bgColor: { rgb: 'FFF200' } } };
*/


//ws[cell_ref] = cell;
console.log("YYYY");
        /* Prueba de rangos
        var cell = {f: 'C2+D2'};
        var cellRef = XLSX.utils.encode_cell({r:0, c:0});
        ws[cellRef] = cell;

        var range = {s:{r: 0, c: 0},
            e: {r: 10, c: 10}};
        ws['!ref'] = XLSX.utils.encode_range(range);
        */
        const excelBuffer: any = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'buffer' });

        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    private ponFont(ws, numCol, numReng, tipoFont, valorFont){
        let cell_ref = XLSX.utils.encode_cell({c:numCol, r:numReng});
        //console.log("ponFont) "+cell_ref + "   " + JSON.stringify(ws[cell_ref]));

        ws[cell_ref]                  = ( ws[cell_ref] == undefined ) ? {"t":"s","v":""} : ws[cell_ref];
        ws[cell_ref].s                = (ws[cell_ref].s == undefined) ? {} : ws[cell_ref].s;
        ws[cell_ref].s.font           = (ws[cell_ref].s.font == undefined) ? {} : ws[cell_ref].s.font;
        ws[cell_ref].s.font[tipoFont] = (ws[cell_ref].s.font[tipoFont] == undefined) ? valorFont : ws[cell_ref].s.font[tipoFont];
    }

    private ponBorder(ws, numCol, numReng, color){
        let cell_ref = XLSX.utils.encode_cell({c:numCol, r:numReng});
        //console.log("ponFont) "+cell_ref + "   " + JSON.stringify(ws[cell_ref]));

        ws[cell_ref]   = ( ws[cell_ref] == undefined ) ? {"t":"s","v":""} : ws[cell_ref];
        ws[cell_ref].s = (ws[cell_ref].s == undefined) ? {} : ws[cell_ref].s;

        ws[cell_ref].s = {border:
                             {  top:    {style: "thin", color: {rgb: color}},
                                right:  {style: "thin", color: {rgb: color}},
                                bottom: {style: "thin", color: {rgb: color}},
                                left:   {style: "thin", color: {rgb: color}}
                              }
                     };
    }

    private alineaTexto(ws, numCol, numReng, tipoAlinea, posicion){
        let cell_ref = XLSX.utils.encode_cell({c:numCol, r:numReng});
        //console.log("1) "+cell_ref + "   " + JSON.stringify(ws[cell_ref]));

        ws[cell_ref]                         = ( ws[cell_ref] == undefined ) ? {"t":"s","v":""} : ws[cell_ref];
        ws[cell_ref].s.alignment             = (ws[cell_ref].s.alignment == undefined) ? {}: ws[cell_ref].s.alignment;
        ws[cell_ref].s.alignment[tipoAlinea] = (ws[cell_ref].s.alignment[tipoAlinea] == undefined) ? posicion: ws[cell_ref].s.alignment[tipoAlinea];
    }

    private setFtoNum(ws, numCol, numReng, ftoNum){
        let cell_ref = XLSX.utils.encode_cell({c:numCol, r:numReng});
        //console.log("1) "+cell_ref + "   " + JSON.stringify(ws[cell_ref]));

        ws[cell_ref] = ( ws[cell_ref] == undefined ) ? {"t":"s","v": 0} : ws[cell_ref];
        XLSX.utils.cell_set_number_format(ws[cell_ref], ftoNum);
    }

    private ponNegritas(ws, numCol, numReng, letraNegrita){
        let cell_ref = XLSX.utils.encode_cell({c:numCol, r:numReng});
        //console.log("ponFont) "+cell_ref + "   " + JSON.stringify(ws[cell_ref]));

        ws[cell_ref]        = ( ws[cell_ref] == undefined ) ? {"t":"s","v":""} : ws[cell_ref];
        ws[cell_ref].s      = (ws[cell_ref].s == undefined) ? {} : ws[cell_ref].s;
        ws[cell_ref].s      = {font: { bold: letraNegrita}};
    }

    private colorCelda(ws, numCol, numReng, colorFondo, colorLetra?, letraNegrita?, tamanioLetra?){
        let cell_ref = XLSX.utils.encode_cell({c:numCol, r:numReng});
        //console.log(cell_ref + "   " + JSON.stringify(ws[cell_ref]));
        ws[cell_ref]        = ( ws[cell_ref] == undefined ) ? {"t":"s","v":""} : ws[cell_ref];
        ws[cell_ref].s      = (ws[cell_ref].s == undefined) ? {} : ws[cell_ref].s;
        ws[cell_ref].s      = { fill: { patternType: 'solid', fgColor: { rgb: colorFondo } },
                                font: { color: { rgb: colorLetra }}};

        if (letraNegrita != true){
            ws[cell_ref].s      = { fill: { patternType: 'solid', fgColor: { rgb: colorFondo } },
                                    font: { color: { rgb: colorLetra }, bold: letraNegrita}};
        }
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {

        let opc3    = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
        let fchHoy  = (new Date()).toLocaleString(undefined, opc3);

        console.log(fchHoy);

        //fchHoy      = fchHoy.replace(/\/g, "").replace(/:/g,"");
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        //FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
        FileSaver.saveAs(data, 'EfectDisponible_' + new Date().getTime() + EXCEL_EXTENSION);
    }

    private _tmpFnc(){

    }

    private getCellClass({ row, column, value }): any {
        return {
            'billDisponibles': value === 'female'
        };
    }

    public getRowClass(row) {
        return {
            'bill-disponibles': row.origen === "Disponible"
        };
    }

    public infoDepositosHMA(filtrosCons) {

        let numBilletes:any = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "monto": 0  };
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["DEP"],
            events: ["CashInStartOk", "NotesValidated", "CashInEndOk"]
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                datosRetirosHMA = datosRetirosHMA.concat(gdatosHMA);
            }

            let arrBilletesRetiro: any[] = [];
            let arrBilletesDeposito: any[] = [];
            let cveCat;
            let billetesRetiro:string = "";
            let billetesDeposito:string = "";

            datosRetirosHMA.forEach((reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];

                switch (reg.Events){
                    case "NotesValidated":
                        billetesDeposito = reg.Data;
                        break;
                    case "CashInEndOk":
                        if (reg.Data > 0) {
                            arrBilletesDeposito.push(billetesDeposito + ";");
                            billetesDeposito = "";
                            //console.log("--> "+JSON.stringify(reg));
                        }
                        break;
                }
            });

            this.billetesRetirados   = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRetiro, ";", "BD");
            console.log(JSON.stringify(this.billetesRetirados));
        }
    }

    /* Exporta datos a excel */
	private exportaEfect2Excel(){

        let f1 = new Date();

        let colWidthList = [
            {wch: 28}, // Tienda
            {wch: 11}, // ID
            {wch: 13}, // IP
            {wch: 18}, // Fecha último corte
            {wch: 33}, // Origen
            {wch: 8}, // $20
            {wch: 8}, // $50
            {wch: 8}, // $100
            {wch: 8}, // $200
            {wch: 8}, // $500
            {wch: 8}, // $1000
            {wch: 11}  // Monto
        ];

        let colWidthDet = [
            {wch: 33}, // Tipo Oper
            {wch: 8}, // Operaciones
            {wch: 8}, // $20
            {wch: 8}, // $50
            {wch: 8}, // $100
            {wch: 8}, // $200
            {wch: 8}, // $500
            {wch: 8}, // $1000
            {wch: 11}  // Monto
        ];

        let ws_name             = "SheetJS";
        let excelFileName       = "prueba";
        let datosExcel:any      = [];
        let colsEfectDisp:any   = {
            tienda: 'Tienda', id: 'ID', ip: 'IP', fchUltimoCorte: 'Fecha último corte', origen: 'Origen',
            b20: '20', b50: '50', b100: '100', b200: '200', b500: '500', b1000: '1000', monto: 'Monto'
        };
        datosExcel.push(colsEfectDisp);

        // Agrega encabezados en el primer elemento del arreglo.
        datosExcel = datosExcel.concat(this.listaDatosEfectivo);

        /* Crea un nuevo libro */
        let wb = XLSX.utils.book_new();

        /* Exporta arreglo Json a Excel */
        let ws = XLSX.utils.json_to_sheet(datosExcel, {skipHeader:true} );

        /* Agrega una nueva hoja en el libro */
        XLSX.utils.book_append_sheet(wb, ws, "Listado");

        /* Indica el ancho de cada columna */
        ws['!cols'] = colWidthList;


        /* Pone color de fondo en las lineas de titulos */
        for(let numCol=0; numCol < 12; numCol++){
            this.colorCelda(ws, numCol, 0, '002060', 'FFFFFF', true, '12pc');
            this.ponFont(ws, numCol, 0, "sz", 12);
        }

        /* Alinea a la derecha los encabezados de las columnas numericas */
        for(let numCol=5; numCol < 12; numCol++) {
            this.alineaTexto(ws, numCol, 0, "horizontal","right");
        }

        /* Formato númerico con signo de peso y separador (coma) en la columna Monto*/
        for(let numReng=1; numReng < datosExcel.length ; numReng++) {
            this.setFtoNum(ws, 5, numReng, "#,##0");
            this.setFtoNum(ws, 6, numReng, "#,##0");
            this.setFtoNum(ws, 7, numReng, "#,##0");
            this.setFtoNum(ws, 8, numReng, "#,##0");
            this.setFtoNum(ws, 9, numReng, "#,##0");
            this.setFtoNum(ws, 10, numReng, "#,##0");
            this.setFtoNum(ws, 11, numReng, "#,##0");
            if(datosExcel[numReng].origen == "Disponible"){
                for(let numCol=0; numCol < 12; numCol++) {
                    this.colorCelda(ws, numCol, numReng, 'DCE6F1', '000000', true, '12pc');
                }
            }
        }


        /* ====================================================================================== */

        let datosPorTienda: any     = {};
        let tmpDatosXtienda: any    = [];
        let datosXtienda: any       = [];
        let numOpers: number        = 0;
        let iniciaReporte:boolean   = true;
        let cntReng:number          = 0;
        let datosDeTienda:any       = [];
        let rangoFechasProc:string  = "";
        let ws2:any;

        this.listaDatosEfectivo.forEach( regEfect => {

            if(iniciaReporte == true){
                datosDeTienda = datosDeTienda.concat({origen: regEfect.tienda, opers: regEfect.id, b20: '', b50: regEfect.ip, b100: '', b200: '', b500: '', b1000: '', monto: ''});
                datosDeTienda = datosDeTienda.concat({origen: 'Tipo Operación', opers: 'Opers', b20: '20', b50: '50', b100: '100', b200: '200', b500: '500', b1000: '1000', monto: 'Monto'});
                iniciaReporte = false;
            }

            numOpers        = 0;
            numOpers        = (regEfect.origen == "Depósitos") ? this.datosTienda[regEfect.ip].numDepositos : numOpers;
            numOpers        = (regEfect.origen == "Retiros") ? this.datosTienda[regEfect.ip].numRetiros : numOpers;
            datosDeTienda   = datosDeTienda.concat( this.agregaDatosTienda(regEfect, numOpers) );

            if (regEfect.origen == "Disponible"){
                rangoFechasProc = "Información reportada a partir del último corte: "+this.datosTienda[regEfect.ip].fchUltimoCorte+" - " + this.fchUltimaActualizacion;
                datosDeTienda   = datosDeTienda.concat({ origen: rangoFechasProc, opers: '', b20: '', b50: '', b100: '', b200: '', b500: '', b1000: '', monto: ''});
                datosDeTienda   = datosDeTienda.concat({ origen: '', opers: '', b20: '', b50: '', b100: '', b200: '', b500: '', b1000: '', monto: ''});
                datosDeTienda   = datosDeTienda.concat({ origen: '', opers: '', b20: '', b50: '', b100: '', b200: '', b500: '', b1000: '', monto: ''});
                iniciaReporte   = true;
            }
        });

        /* Crea la nueva hoja y carga la información */
        ws2                 = XLSX.utils.json_to_sheet(datosDeTienda, {skipHeader: true});

        /* Aplica la longitud de las columnas */
        ws2['!cols']        = colWidthDet;

        /* Pone color de fondo en las lineas de titulos */
        let numRenglon      = 0;
        let renglonesBloque = 10;
        let rangoMerges:any = [];

        for(let numTiendas = 0; numTiendas < this.numTiendas; numTiendas++){

            this.estiloEncabezados(ws2, numRenglon);
            this.ponFont(ws2, 0, (numRenglon+7), "bold", true);
            this.ponFont(ws2, 0, (numRenglon+7), "sz", 9);

            rangoMerges = rangoMerges.concat({s:{c:1, r:numRenglon}, e:{c:2, r:numRenglon}});
            rangoMerges = rangoMerges.concat({s:{c:0, r:(numRenglon+7)}, e:{c:8, r:(numRenglon+7)}});

            numRenglon += renglonesBloque;
        }

        /* Agrega a la hora los rangos de las celdas que se combinan */
        ws2['!merges']  = rangoMerges;

        /* Agrega la hora dos al libro */
        XLSX.utils.book_append_sheet(wb, ws2, "InfoPorTienda");

        /* Exporta datos a formato excel tipo xlsx */
        const excelBuffer: any = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'buffer' });

        /* Solicita el nombre del archivo mediante el Explorar de Windows */
        this.saveAsExcelFile(excelBuffer, excelFileName);

        /* ====================================================================================== */

        /* Indica el rango de celdas que serán consideradas en el cache */
        ws['!ref'] = "A1:J50";



        /* Pinta el borde en la primera sección */
        for (let numCol = 0; numCol < 9; numCol++){
            for (let numReng = 2; numReng < 5; numReng++) {
                this.ponBorder(ws, numCol, numReng, '000000');
            }
        }

        /* Pinta el borde en la segunda sección */
        for (let numCol = 0; numCol < 9; numCol++){
            for (let numReng = 7; numReng < 9; numReng++) {
                this.ponBorder(ws, numCol, numReng, '000000');
            }
        }

        /* Formato númerico con separador (coma) */
        for(let numCol=2; numCol < 8; numCol++) {
            this.setFtoNum(ws, numCol, 2, "#,##0");
        }

        /* Formato númerico con signo de peso y separador (coma) en la columna Monto*/
        for(let numReng=2; numReng < 5; numReng++) {
            this.setFtoNum(ws, 8, numReng, "$#,##0");
        }

        /* Formato númerico con signo de peso y separador (coma) en los encabezados de las dos secciones */
        for(let numCol=2; numCol < 8; numCol++) {
            this.setFtoNum(ws, numCol, 1, "$#,##0");
            this.setFtoNum(ws, numCol, 6, "$#,##0");
        }

        /* Pone color de fondo en las lineas de titulos */
        for(let numCol=0; numCol < 9; numCol++){
            this.colorCelda(ws, numCol, 0, '002060', 'FFFFFF', false, '10pc');
            this.colorCelda(ws, numCol, 1, '0070C0', 'FFFFFF', false, '10pc');
            this.colorCelda(ws, numCol, 6, '0070C0', 'FFFFFF', false, '10pc');

        }

        /* Pone letras bold al renglon de Totales Disponible */
        for(let numCol=0; numCol < 9; numCol++) {
            //this.ponNegritas(ws, numCol, 4, true);
        }

        for(let numCol=1; numCol < 9; numCol++) {
            this.alineaTexto(ws, numCol, 1, "horizontal","right");
            this.alineaTexto(ws, numCol, 6, "horizontal","right");
        }

        this.ponFont(ws, 0, 9, "sz", 9);

        //const excelBuffer: any = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'buffer' });

        //this.saveAsExcelFile(excelBuffer, excelFileName);
        let f2 = new Date();
        console.log("Duración: " + this.utilsService.calculaTiempoDuracion(f1, f2));
	}


    private agregaDatosTienda(_listaDatosEfectivo, _numOpers){

        let _datosPorTienda:any = {};

        _datosPorTienda["origen"] = _listaDatosEfectivo.origen;
        _datosPorTienda["opers"]  = _numOpers;
        _datosPorTienda["b20"]    = _listaDatosEfectivo.b20;
        _datosPorTienda["b50"]    = _listaDatosEfectivo.b50;
        _datosPorTienda["b100"]   = _listaDatosEfectivo.b100;
        _datosPorTienda["b200"]   = _listaDatosEfectivo.b200;
        _datosPorTienda["b500"]   = _listaDatosEfectivo.b500;
        _datosPorTienda["b1000"]  = _listaDatosEfectivo.b1000;
        _datosPorTienda["monto"]  = _listaDatosEfectivo.monto;

        return(_datosPorTienda);
    }

    private estiloEncabezados(_ws2, _numReng) {

        for (let numCol = 0; numCol < 9; numCol++) {

            /* Pone color de fondo en las lineas de titulos */
            this.colorCelda(_ws2, numCol, _numReng, '002060', 'FFFFFF', true, '10pc');
            this.colorCelda(_ws2, numCol, (_numReng+1), '0070C0', 'FFFFFF', true, '10pc');

            /* Poner bold a los renglones de encabezados y Efectivo Disponible */
            this.ponFont(_ws2, numCol, (_numReng), "bold", true);
            this.ponFont(_ws2, numCol, (_numReng+1), "bold", true);
            this.ponFont(_ws2, numCol, (_numReng+6), "bold", true);
        }

        for(let numCol=1; numCol < 9; numCol++){

            /* Justifica a la derecha los titulos de las columnas numericas */
            this.alineaTexto(_ws2, numCol, (_numReng+1), "horizontal","right");

            /* Pon formato con separador de comas en columna numericas */
            for(let numReng=(_numReng+2); numReng < (_numReng+7); numReng++){
                this.setFtoNum(_ws2, numCol, numReng, "#,##0");
            }
        }
    }

	private isNumber(val?){
        return(isNaN(val));
    }
}
