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
    templateUrl: './efect-disp-x-atm.component.html',
    styleUrls  : ['./efect-disp-x-atm.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, DatosJournalService, UtilsService, LogHmaService, SweetAlertService]
})
export class EfectDispXAtmCoponent implements OnInit {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos: any = [];
    public dTipoListaParams: string = "A";
    public dSolicitaFechasIni = true;
    public dSolicitaFechasFin = true;
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

    private billCasetesRecicla:any  = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "totBill": 0  };
    private billCasetesRechazos:any = {"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "totBill": 0  };
    private atmName:string = "";
    private ipAtm:string   = "";
    private descAtm:string = "";

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public depositosPorTiendaService: DepositosPorTiendaService,
                public datosJournalService: DatosJournalService,
                public utilsService: UtilsService,
                public logHmaService: LogHmaService,
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

        let fIniParam   = infoRecibida.fchInicio;
        let fFinParam   = infoRecibida.fchFin;
        let ipAtm       = infoRecibida.atm;
        let descAtm     = infoRecibida.descAtm;
        let fchIniParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let datosParam: any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm, descAtm: descAtm};

        this.obtenDetalleRetiros(datosParam);
    }


    public obtenDetalleRetiros(filtrosCons:any) {
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

        billetesDisponibles                 = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
        datosCortesJournal                  = this.datosJournalService.obtenCortesJournal(filtrosCons);
        ultimoCorte                         = datosCortesJournal[datosCortesJournal.length -1];
        this.descAtm                        = filtrosCons.descAtm;
        this.atmName                        = ultimoCorte.AtmName;
        this.ipAtm                          = ultimoCorte.Ip;
//console.log(JSON.stringify(datosCortesJournal));
        if (ultimoCorte == undefined || ultimoCorte == null){
            return(0);
        }

        fchUltimoCorte              = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, opc2);
        montoUltimoCorte            = ultimoCorte.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
        fchUltimoCorte1             = fchUltimoCorte.replace(/[\/ :]/g,"-").split("-");
        fchUltimoCorte2             = sprintf("%4d-%02d-%02d-%02d-%02d", fchUltimoCorte1[2], fchUltimoCorte1[1], fchUltimoCorte1[0], fchUltimoCorte1[3], fchUltimoCorte1[4]);

        filtrosCons                 = JSON.parse(filtrosConsMovtos);
        filtrosCons.timeStampStart  = fchUltimoCorte2;

        //this.datosUltimoCorte       = sprintf("%02d-%02d-%4d-%02d-%02d", fchUltimoCorte1[0], fchUltimoCorte1[1], fchUltimoCorte1[2], fchUltimoCorte1[3], fchUltimoCorte1[4]);
        this.datosUltimoCorte       = new Date(ultimoCorte.TimeStamp).toLocaleDateString('es', opc3);
        // Depositos Journal
        this.billetesDepositados = this.infoDepositosJournal(filtrosCons);
        console.log("Depositos:  "+JSON.stringify(this.billetesDepositados));

        // Retiros HMA
        this.billetesRetirados = this.infoRetirosHMA(filtrosCons);
        console.log("Retiros:    "+JSON.stringify(this.billetesRetirados));

        // Billetes Disponibles
        this.arrBilletesDisponibles[0] = this.calcBillDisponible(this.billetesDepositados, this.billetesRetirados);

        // Ingreso a Casete Reciclaje
        let billCaseterosReciclados:any = this.infoFullStatus(filtrosCons);
        console.log("FullStatus: <<"+JSON.stringify(billCaseterosReciclados)+">>");


        // Infreso a Casete Rechazos
        let billCaseterosRechazos:any = this.infoCashUnitStatus(filtrosCons);
        console.log("CashUnitStatus: <<"+JSON.stringify(billCaseterosRechazos)+">>");

        this.calculaRechazos(this.billetesDepositados, billCaseterosReciclados, billCaseterosRechazos);
        
        let ftoFchFinCons:any       = {year: 'numeric', month: '2-digit', day: '2-digit',hour: '2-digit', minute: '2-digit', second: '2-digit'};
        let expFchFinCons:any       = /(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/;
        let fchFinCons:any          = filtrosCons.timeStampEnd.toLocaleString('en-us', ftoFchFinCons).replace(expFchFinCons, '$3/$2/$1 $4:$5');

        this.fchUltimaActualizacion = fchFinCons;
        this.fchUltimaActualizacion = new Date().toLocaleDateString('es', opc3);
        this.filtrosUtilsService.fchaHraUltimaActualizacion();

        let f2 = new Date();
        console.log("Duración: " + this.utilsService.calculaTiempoDuracion(f1, f2));
    }


    /*
    Procedimiento para obtener la fecha y hora del siguiente corte posterior al anterior en caso de que la fecha de en que se ejecuta
    el proceso no sea igual al actual.
    1) La fecha del proceso es igual a la del sistema o un minutos antes, se debe de considerar esta fecha (parametro) como fin.
    2) La fecha final del parametro es menor a la fecha del sistema.
        Buscar cortes de la ETV a partir de la fecha.
        buscar esta linea es para hacer una prueba de autosave.
    */


    private calcBillDisponible(billDepositados, billRetirados){

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
            let idx:number = 0;

            datosJournal.forEach((reg) => {
                if (reg.SwitchResponseCode == 0) {
                    idx = reg.Data.indexOf("[");
                    arrBilletesJournal.push(reg.Data.substring(idx));
                }
            });

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

        let numBilletes:AcumulaBilletesModel;
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
                        break;
                }
            });

            numBilletes = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRetiro, ";", "BD");

        }

        return(numBilletes);
    }

    private calculaRechazos(billetesDepositados, billCaseterosReciclados, billCaseterosRechazos){
        this.billCasetesRechazos.b20     = billetesDepositados.b20;
        this.billCasetesRechazos.b50     = (billetesDepositados.b50  - billCaseterosReciclados.b50) + billCaseterosRechazos.Cnt[0];
        this.billCasetesRechazos.b100    = (billetesDepositados.b100 - billCaseterosReciclados.b100) + billCaseterosRechazos.Cnt[1];
        this.billCasetesRechazos.b200    = (billetesDepositados.b200 - billCaseterosReciclados.b200) + billCaseterosRechazos.Cnt[2];
        this.billCasetesRechazos.b500    = (billetesDepositados.b500 - billCaseterosReciclados.b500) + billCaseterosRechazos.Cnt[3];

        this.billCasetesRechazos.b1000   = billetesDepositados.b1000;
        this.billCasetesRechazos.totBill = this.billCasetesRechazos.b20 + this.billCasetesRechazos.b50 + this.billCasetesRechazos.b100 +
                                           this.billCasetesRechazos.b200 + this.billCasetesRechazos.b500 + this.billCasetesRechazos.b1000;
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
            billCasetesRecicla = {"FchHra": tmpFchHora, "Cnt": [ [0,0], [0,0], [0,0], [0,0] ],"b20": 0,"b50": 0,"b100": 0,"b200": 0,"b500": 0,"b1000": 0, "totBill": 0  };

            datosBilletesHMA.Data.split("%").forEach( reg => {
                cntBill = reg.split("-");
                billCasetesRecicla.Cnt[idx++] = [ parseInt(cntBill[2]), parseInt(cntBill[3])];
                billAct += parseInt(cntBill[2]);
                billIng += parseInt(cntBill[3]);
            });

            billCasetesRecicla.Cnt[idx] = [ billAct, billIng];
            billCasetesRecicla.b50      = billCasetesRecicla.Cnt[0][1];
            billCasetesRecicla.b100     = billCasetesRecicla.Cnt[1][1];
            billCasetesRecicla.b200     = billCasetesRecicla.Cnt[2][1];
            billCasetesRecicla.b500     = billCasetesRecicla.Cnt[3][1];
            billCasetesRecicla.totBill  = billIng;

            this.billCasetesRecicla.b20      = 0;
            this.billCasetesRecicla.b50      = billCasetesRecicla.Cnt[0][1];
            this.billCasetesRecicla.b100     = billCasetesRecicla.Cnt[1][1];
            this.billCasetesRecicla.b200     = billCasetesRecicla.Cnt[2][1];
            this.billCasetesRecicla.b500     = billCasetesRecicla.Cnt[3][1];
            this.billCasetesRecicla.b1000    = 0;
            this.billCasetesRecicla.totBill  = billIng;
        }

        return(billCasetesRecicla);
    }

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
            datosCashUnitStatus = {"FchHra": tmpFchHora, "Cnt": [0,0,0,0]};

            billetesRechazos.Data.split(";").forEach( reg => {
                cntBill = reg.split("-");
                datosCashUnitStatus.Cnt[idx++] = parseInt(cntBill[2]);
                billRech += parseInt(cntBill[2]);
            });
            datosCashUnitStatus.Cnt[idx] = billRech;
            this.billCasetesRechazos.totBill = billRech;
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
        console.log("ponFont) "+cell_ref + "   " + JSON.stringify(ws[cell_ref]));

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

        //ws[cell_ref].s = {fill: { patternType: 'solid', fgColor: { theme: 8, tint: 0.3999755851924192, rgb: colorFondo }, bgColor: { rgb: 'FFF200' } },
        //    font: { bold: letraNegrita, color: { rgb: colorLetra }}};
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }
  

/*
    public infoLogHMA(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD", "DEP"],
            events: ["DenominateInfo", "DispenseOk", "NotesValidated", "CashInEndOk"]
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
                    case "DenominateInfo":
                        billetesRetiro = reg.Data;
                        break;
                    case "DispenseOk":
                        arrBilletesRetiro.push(billetesRetiro + ";");
                        billetesRetiro = "";
                        break;
                    case "NotesValidated":
                        billetesDeposito = reg.Data;
                        break;
                    case "CashInEndOk":
                        arrBilletesDeposito.push(billetesDeposito + ";");
                        billetesDeposito = "";
                        break;
                }
            });

            this.billetesRetirados   = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRetiro, ";", "BD");
            this.billetesDepositados = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesDeposito, ";", "BD");
            console.log(JSON.stringify(this.billetesRetirados));
            console.log(JSON.stringify(this.billetesDepositados));
        }

        let billCaseterosReciclados:any = this.infoFullStatus(filtrosCons);
        let billCaseterosRechazos:any = this.infoCashUnitStatus(filtrosCons);

        this.calculaRechazos(this.billetesDepositados, billCaseterosReciclados, billCaseterosRechazos);
        this.infoDepositosJournal(filtrosCons);
        this.infoDepositosHMA(filtrosCons);
        return(numBilletes);
    }

*/

/*
    private infoDepositos(filtrosCons){
        let numBilletes:AcumulaBilletesModel;
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart,timeStampEnd: filtrosCons.timeStampEnd,
            events: ["CashManagement"], minAmount: -1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength, false);

        let datosCortesJournal: any = [];

        if (gPaginasJournal.TotalPages > 0) {
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage, false);
                datosCortesJournal = datosCortesJournal.concat(gDatosJournal);
            }
        }

        datosCortesJournal.forEach( reg => {
            console.log(reg.Data);
        });
    }
*/




/*
    public infoCortesETV:any[] = [];

    public datosCortesETV(datosCortesJournal){
        this.infoCortesETV = [];

        datosCortesJournal.forEach( (reg) => {
            this.infoCortesETV.push({
                TimeStamp: reg.TimeStamp, AtmName: reg.AtmName, Ip: reg.Ip, Amount: reg.Amount
            })
        })

        this.infoCortesETV.sort(this.utilsService.sort_by('TimeStamp', true, parseInt));
    }
*/
    /*
    GetEjaLogDataLength(paginasJoural: any, status) {
        gPaginasJoural = paginasJoural;
    }

    GetEjaLogPage(datosJoural: any, status) {
        gDatosJoural = datosJoural;
    }
    */






/*
    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
    }

    public GetEjaLogPage(datosCortesJournal:any, status){
        gDatosJournal = datosCortesJournal;
    }
*/
/*
    public infoDepositosEnJournalX(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
        let paramsCons:any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["CashManagement"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength, false);

        if (gPaginasJournal.TotalPages > 0) {
            let datosJournal: any = [];
            //gDatosJournal = [];

            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage, false);
                datosJournal = datosJournal.concat(gDatosJournal);
            }

            //console.log(JSON.stringify(datosJournal));
            let arrBilletesJournal: any[] = [];

            datosJournal.forEach((reg) => {
                let i = reg.Data.indexOf("[");
                arrBilletesJournal.push(reg.Data.substring(i));
            });

            numBilletes = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesJournal, "|", "BD");
            //console.log(JSON.stringify(numBilletes));
        }
        return(numBilletes);
    }
*/
    public infoDepositosHMA(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
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

//console.log(JSON.stringify(datosRetirosHMA));

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
            //this.billetesDepositados = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesDeposito, ";", "BD");
            console.log(JSON.stringify(this.billetesRetirados));
            //console.log(JSON.stringify(this.billetesDepositados));
        }

        /*
        let billCaseterosReciclados:any = this.infoFullStatus(filtrosCons);
        let billCaseterosRechazos:any = this.infoCashUnitStatus(filtrosCons);

        this.calculaRechazos(this.billetesDepositados, billCaseterosReciclados, billCaseterosRechazos);
        this.infoDepositosEnJournal(filtrosCons);
        */
        //return(numBilletes);
    }
}
