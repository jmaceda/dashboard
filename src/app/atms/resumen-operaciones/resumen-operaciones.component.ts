import { Component, OnInit }                             from '@angular/core';
import { Input, Output} from '@angular/core';
import { LocationStrategy, PlatformLocation, Location }  from '@angular/common';
import { LegendItem, ChartType }                         from '../../lbd/lbd-chart/lbd-chart.component';
import * as Chartist                                     from 'chartist';
import { SoapService }                                   from '../../services/soap.service';
import { sprintf }                                       from "sprintf-js";
import {FormGroup, FormBuilder, Validators}              from '@angular/forms';
import { DepositosModel }                                from './models/depositos';
import 'rxjs/add/operator/pairwise';
import { Router }                               from '@angular/router';
import { ActivatedRoute }                       from '@angular/router';

// Importamos la clase del servicio
import { DesglosaBilletes }                     from './services/DesglosaBilletes.service';
import { GuardaDepositosBD }                    from './services/GuardaDepositosBD.service';
import { ErroresPorBanco }                      from '../../model/errores-por-banco.model';
//import { ResOpersService }                    from '../../services/res-opers.service';
//import { ResOpersModel, IResOpersModel }      from '../../model/res-opers.model';
//import { DataBaseService }                    from '../../services/data-base.service';



class ResumenOpers {
    desc: string;
    numOpers: number;
    monto: number;
    fchPrimerMto: string;
    fchUltimoMto: string;

    constructor(desc: string, numOpers: number, monto: number, fchPrimerMto: string, fchUltimoMto: string) {
        this.desc = desc;
        this.numOpers = numOpers;
        this.monto = monto;
        this.fchPrimerMto = fchPrimerMto;
        this.fchUltimoMto = fchUltimoMto;
    }
}

export var gNumPaginas                 = 0;
export var gNumRegistros               = 0;
export var gNumRegsProcesados          = 0;
export var aDatosJournal               = [];
export var gNumPaginasCompletas = 0;
//export var tIdx:number = 0;

var fechaSys = new Date();
var fechaHoy = sprintf("%4d-%02d-%02d",fechaSys.getFullYear(), (fechaSys.getMonth() + 1), fechaSys.getDate());
var ipAnterior:string = null;
var gFchInicioAnterior = null;
var gFchInicioFinAnterior = null;


// Formatea numeros
var l10nUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
var request;
var objStore;
var tiempoRefreshDatos:number = (1000 * 30 * 1); // Actualiza la información cada minuto.

//var Dexie;                    //require('dexie');
var dbDexie;
var db3;
var openRequest;
var storeRequest;
var bdRedBlu = 'RedBluDB';
var intervalId = null;
var arrDepositos = [];
var nomComponente:string = "ResumenOperacionesComponent"
declare interface TblResumenPorBanco {
    dataRows: any[];
    totalRows: any[];
}

declare interface TblResumenDepositos {
    dataRows: any[];
}

export var arrDatosServidor:any[]     = [];
export var arrDatosServidorInc:any[]  = [];
export var arrDatosServidorBack:any[] = [];
export var numPagsCompletas:number    = 0;
export var numPaginaObtenida:number   = 0;


declare interface InterRetirosPorHora {
    headerRow: any[];
    datos: any[];
}

declare interface TblConsRetPorMes {
    datos: any[];
}


export class TblDomResOperacion{
    headerRow: any[];
    dataRows: any[];
}

export class TblResOperacion{
    dataRows: any[];
}

export class ErroresPorBancoX {
    private _name: string;
    public banco: number[] = [];

    constructor (name: string) {
        this._name = name;
    }

    acumulaError(name: string){

    }
}

export class DatosRetirosXhora{
    public dNumConsPorHora:number;
    public dNumRetirosPorHora:number;
    public dAcumMontoRetirosPorHora:number;

    constructor() {
        this.dNumConsPorHora = 0
        this.dNumRetirosPorHora = 0
        this.dAcumMontoRetirosPorHora = 0
    }
}


export var datosATMs  = [];
export var ipATMs  = [];
var idxErrBanco:number = 0;

@Component({
  selector   : 'app-home',
  templateUrl: './resumen-operaciones.component.html',
  styleUrls  : ['./resumen-operaciones.component.css'],
  styles     : [`
  .even { color: red; }
  .odd { color: green; }
  `],
  providers: [
      SoapService,
      DesglosaBilletes,
      GuardaDepositosBD,
      //ResOpersService,
      //DataBaseService
  ],
})
export class ResumenOperacionesComponent implements OnInit  {

    chartOptions = {
        responsive: true
    };

    chartData = [
        { data: [330, 600, 260, 700], label: 'Account A' },
        { data: [120, 455, 100, 340], label: 'Account B' },
        { data: [45, 67, 800, 500], label: 'Account C' }
    ];

    //chartLabels = ['January', 'February', 'Mars', 'April'];

    /*
    onChartClick(event) {
        console.log(event);
    }
*/
    /*
    newDataPoint(dataArr = [100, 100, 100], label) {

        this.chartData.forEach((dataset, index) => {
            this.chartData[index] = Object.assign({}, this.chartData[index], {
                data: [...this.chartData[index].data, dataArr[index]]
            });
        });

        this.chartLabels = [...this.chartLabels, label];

    }
    */


    //Level = Level;



    /*
    private myDatePickerOptions: IMyDpOptions = {
        dateFormat: 'dd.mm.yyyy',
        height    : '34px',
        width     : '210px',
        inline    : false
    };

    private myForm  : FormGroup;
    private selector: number = 0;
*/
    // Initialized to specific date (09.10.2018).
   // private model: Object = { date: { year: 2018, month: 10, day: 9 } };


    resumenOpers: ResumenOpers[];

    //public tblDomResOperacion: TblDomResOperacion;
    public tblResumenPorBanco: TblResumenPorBanco;
    public tblResumenDepositos: TblResumenDepositos;


    public emailChartType       : ChartType;
    public emailChartData       : any;
    public emailChartLegendItems: LegendItem[];

    public hoursChartType       : ChartType;
    public hoursChartData       : any;
    public hoursChartOptions    : any;
    public hoursChartResponsive : any[];
    public hoursChartLegendItems: LegendItem[];

    public tipoGraficaRetirosPorHora      : ChartType;
    //public datosGraficaRetirosPorHora     : any;
    public opcionesGraficaRetirosPorHora  : any;
    public responsiveGraficaRetirosPorHora: any[];
    public elementosGraficaRetirosPorHora : LegendItem[];

    /*
    public activityChartType       : ChartType;
    public activityChartData       : any;
    public activityChartOptions    : any;
    public activityChartResponsive : any[];
    public activityChartLegendItems: LegendItem[];
*/
    //public bsValue     : any ;
    //public bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];

    //selectedItem: any;
    //icons       : string[];
    items       : Array<{title: string, note: string, icon: string}>;

    //public url: string                  = 'https://manager.redblu.com.mx:8080/services/dataservices.asmx';
    public url: string = '/dataservices.asmx'; //  QA
    //public url: string = '/services/dataservices.asmx'; // Prod
    public nomServicioPaginas: string   = 'GetEjaLogDataLength';
    public nomServicioDatosLog: string  = 'GetEjaLogPage';
    public TotalItems:number            = 0;
    public TotalPages:number            = 0;
    public tmpTotalItems:number         = 0;
    public tmpTotalPages:number         = 0;

    public numRetiros:number      = 0;
    public numConsultas:number    = 0;
    public tmpNumRetiros:number   = 0;
    public tmpNumConsultas:number = 0;
    public dFchIniProceso: string = '2017-09-10';
    public dFchFinProceso: string = '2017-09-10';
    public dHraIniProceso: string = '00-00';
    public dHraFinProceso: string = '23-59';

    public dNumDepositos: number      = 0;
    public dMontoDepositos: number    = 0;
    public dPrimerDeposito: string    = "";
    public dUltimoDeposito: string    = "";
    public dHraPrimerDeposito: string = "";
    public dHraUltimoDeposito: string = "";
    public dHraIniciaSesion: string = "";

    public dNumRetiros: number      = 0;
    public dMontoRetiros: number    = 0;
    public dMontoConsultas: number    = 0;
    public dMontoConsultasNoExito: number    = 0;
    public dHraPrimerRetiro: string = "";
    public dHraUltimoRetiro: string = "";

    // Retiros no exitosos
    public dNumRetirosNoExito: number      = 0;
    public dMontoRetirosNoExito: number    = 0;
    public dHraPrimerRetiroNoExito: string = "";
    public dHraUltimoRetiroNoExito: string = "";

    public dNumConsultas: number       = 0;
    public dHraPrimeraConsulta: string = "";
    public dHraUltimaConsulta: string  = "";

    public dNumConsultasNoExito: number       = 0;
    public dHraPrimeraConsultaNoExito: string = "";
    public dHraUltimaConsultaNoExito: string  = "";

    public dNumReversos: number      = 0;
    public dMontoReversos: number    = 0;
    public dHraPrimerReverso: string = "";
    public dHraUltimoReverso: string = "";

    public dNumCambioNIP: number       = 0;
    public dHraPrimerCambioNIP: string = "";
    public dHraUltimoCambioNIP: string = "";

    public dNumCambioNIPNoExito: number       = 0;
    public dHraPrimerCambioNIPNoExito: string = "";
    public dHraUltimoCambioNIPNoExito: string = "";

    public dNumRetirosPorHora      : Array<number>;
    public dNumConsultasPorHora    : Array<number>;
    public dAcumNumRetirosPorHora  : Array<number>;
    public dAcumNumConsultasPorHora: Array<number>;
    public dMontoRetirosPorHora    : Array<number>;
    public dAcumMontoRetirosPorHora: Array<number>;
    public dNumConsPorHora         : Array<number>;
    public opersBanco : object   = new Object();
    public listaBancos: any[] = [];
    public tBillDep:any[] = [{ tMonto: 0, tB20: 0, tB50: 0, tB100: 0, tB200: 0, tB500: 0, tB1000: 0}];
    public infoDepositos: DepositosModel[] = [];
    public datosRetirosXhora: Array<DatosRetirosXhora> = new Array(24);

    public encabRetPorHora  = {hHora:'Hora', hCons:'Consultas', hAcumCons:'Acumulado', hRet:'Retiros', hMonto: 'Monto', hAcumRet:'Acumulado'};
    public encabResumenOper = {hDesc:'Descripción', hOper:'Opers', hMonto:'Monto', hPrimera:'Primera', hUltima:'Última'};
    public encabResPorBanco = {hBanco:'Banco', hNumRetOk:'Retiros Exitosos', hNumRetNoOk:'Retiros Fallidos', hNumCons:'Consultas', hNumConsNoOk:'Consultas Fallidas', hNumReversos: 'Reversos'};
    public encabDepositos   = {hId:'ID', dCta: 'Cuenta', hHraIni:'Inicio', hHraFin: 'Finalizo', hMonto:'Monto', hBill20:'$20', hBill50:'$50', hBill100:'$100', hBill200:'$200', hBill500:'$500', hBill1000:'$1000'};

    public ipATM: string;

    public tblConsRetPorMes: TblConsRetPorMes;
    public iPs:any[] = ['11.40.2.2', '11.40.2.8'];

    public iniArrCeros(numElems, valIni):Array<number>{
        return([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    }

    public datosATMs:any[] = [];
    public ipATMs:any[] = [];

    public paramsServicioNumPaginas:any = { ip: [], timeStampStart: "", timeStampEnd: "", events: "-1", minAmount: "-1", maxAmount: "-1", authId: "-1", cardNumber: "-1", accountId: "-1"};
    public paramsServicioDatosLog:any = { ip: [], timeStampStart: "", timeStampEnd: "", events: "-1", minAmount: "-1", maxAmount: "-1", authId: "-1", cardNumber: "-1", accountId: "-1", page: 0 };
    public tblResOperacion: TblResOperacion;
    public retiros: InterRetirosPorHora;
    public retiroNoOk    : object = {};
    public resumenPorBanco: Array<number> = [0, 0, 0, 0, 0, 0, 0];  //Dep, Ret, RetNo, Rech, Cons,ConsNo, Rev
    public listaErroresOper: any[] = [];
    public dotacion:any = {monto:0, estado: '', iniciaDota:'', terminaDota: ''};
    public minutosSinOperacion:number = 1;
    public tiempoSinOperaciones:number = 0;
    public msgError:string = "";
    public deposito:any = {terminaDota: '', iniciaDeposito: '', tiempoDowntime: '', montoDowntime: 0};
    public arrTarjetas:any[] = [];
    public listaErrsPorBanco: any[][] = [];
    public cErroresPorBanco: ErroresPorBanco[];
    public lErroresPorBanco: ErroresPorBanco[];
    public dUltimaActualizacion: string;
    public numPaginas = 0;
    public openRequest2;
    public rutaActual = "";
    public urlPath = "";


    constructor(private formBuilder: FormBuilder,
                public _soapService: SoapService,
                private _desglosaBilletes: DesglosaBilletes,
                public _guardaDepositosBD: GuardaDepositosBD,
                public activatedRoute: ActivatedRoute){
        //resOpersService: ResOpersService){

        console.log("ResumenOperacionesComponent:: Inicia");
        this.activatedRoute.url.subscribe(url =>{
            this.urlPath = url[0].path;
            console.log("constructor:: -->"+this.urlPath+"<--");

        });

        /*
         this._resOpersService = resOpersService;

         this._newResOpers.Descripcion = "Nuevo registro";
         this._newResOpers.NumOpers = 34;
         this._newResOpers.Monto = 1500;
         this._newResOpers.FchPrimerMto = "2017-12-11-00-03";
         this._newResOpers.FchUltimoMto = "2017-12-11-23-59";
         this.nuevoResOpers();
         */

        this.inicializaVariables();

    }

    inicializaVariables(): void {

        this.TotalItems    = 0;
        this.TotalPages    = 0;
        this.tmpTotalItems = 0;
        this.tmpTotalPages = 0;

        this.numRetiros      = 0;
        this.numConsultas    = 0;
        this.tmpNumRetiros   = 0;
        this.tmpNumConsultas = 0;

        this.dNumDepositos      = 0;
        this.dMontoDepositos    = 0;
        this.dPrimerDeposito    = "";
        this.dUltimoDeposito    = "";
        this.dHraPrimerDeposito = "";
        this.dHraUltimoDeposito = "";
        this.dHraIniciaSesion = "";

        this.dNumRetiros      = 0;
        this.dMontoRetiros    = 0;
        this.dMontoConsultas    = 0;
        this.dMontoConsultasNoExito = 0;
        this.dHraPrimerRetiro = "";
        this.dHraUltimoRetiro = "";

        // Retiros no exitosos
        this.dNumRetirosNoExito      = 0;
        this.dNumRetirosNoExito      = 0;
        this.dMontoRetirosNoExito    = 0;
        this.dHraPrimerRetiroNoExito = "";
        this.dHraUltimoRetiroNoExito = "";
    
        this.dNumConsultas       = 0;
        this.dHraPrimeraConsulta = "";
        this.dHraUltimaConsulta  = "";
    
        this.dNumConsultasNoExito       = 0;
        this.dHraPrimeraConsultaNoExito = "";
        this.dHraUltimaConsultaNoExito  = "";
    
        this.dNumReversos      = 0;
        this.dMontoReversos    = 0;
        this.dHraPrimerReverso = "";
        this.dHraUltimoReverso = "";
    
        this.dNumCambioNIP       = 0;
        this.dHraPrimerCambioNIP = "";
        this.dHraUltimoCambioNIP = "";
    
        this.dNumCambioNIPNoExito       = 0;
        this.dHraPrimerCambioNIPNoExito = "";
        this.dHraUltimoCambioNIPNoExito = "";
        
        this.dNumRetirosPorHora       = this.iniArrCeros(24, 0);
        this.dNumConsultasPorHora     = this.iniArrCeros(24, 0);
        this.dAcumNumRetirosPorHora   = this.iniArrCeros(24, 0);
        this.dAcumNumConsultasPorHora = this.iniArrCeros(24, 0);
        this.dMontoRetirosPorHora     = this.iniArrCeros(24, 0);
        this.dAcumMontoRetirosPorHora = this.iniArrCeros(24, 0);
        this.dNumConsPorHora          = this.iniArrCeros(24, 0);
        this.tBillDep                 = [{ tMonto: 0, tB20: 0, tB50: 0, tB100: 0, tB200: 0, tB500: 0, tB1000: 0}];

        this.infoDepositos = [];


        this.opersBanco  = {'nomBanco': "", 'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
        this.listaBancos = [];

        arrDatosServidor = [];
        for(let idx=0; idx<24; idx++){
            this.datosRetirosXhora[idx] = new DatosRetirosXhora();
        }

        arrDepositos = [];
        this.listaErroresOper = [];
        this.lErroresPorBanco = [];
        idxErrBanco=0;

        this.resumenOpers = [
            new ResumenOpers("Depósitos Exitosos", 0, 0, '', '')
        ]
    };


    ngOnInit() {

        this.activatedRoute.url.subscribe(url =>{
            this.urlPath = url[0].path;
            console.log("ngOnInit -->"+this.urlPath+"<--");

        });

        this.resumenInicialOperaciones();
    }


    resumenInicialOperaciones(){
        this.mResumenOperaciones();
        this.mRretirosPorHora();
        this.mResumenPorBanco();
        this.pResumenDepositos();
    }


    parametrosConsulta(filtrosConsulta){

        console.log(nomComponente+".parametrosConsulta:: Se va mostrar la información enviada desde el componente Params");
        console.log(nomComponente+".parametrosConsulta:: Params recibidos: ["+JSON.stringify(filtrosConsulta)+"]");
        console.log(nomComponente+".parametrosConsulta:: Se mostro la información enviada desde el componente Params");
        let parametrosConsulta:any = {};

        let fIniParam = filtrosConsulta.fchInicio;
        let fFinParam = filtrosConsulta.fchFin;
        let ipParam   = filtrosConsulta.atm;

        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);

        console.log(nomComponente+".parametrosConsulta:: ["+fchIniParam+"]");

        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);

        console.log(nomComponente+".parametrosConsulta:: ["+fchFinParam+"]");

        let paramsConsulta:any = {fchIni: fchIniParam, fchFin: fchFinParam, ip: ipParam};

        this.pDatosDelJournal(paramsConsulta);
    }


    pDatosDelJournal(paramsConsulta){

        console.log("pDatosDelJournal -->"+this.urlPath+"<--");
        if (this.urlPath != "operaciones"){
            console.log("pDatosDelJournal:: No va a cargar los datos");
            return(0);
        }

        // *** Actualiza parametros para la consulta de los servicios.
        this.paramsServicioNumPaginas.timeStampStart    = paramsConsulta.fchIni;
        this.paramsServicioNumPaginas.timeStampEnd      = paramsConsulta.fchFin;

        this.paramsServicioDatosLog.timeStampStart      = paramsConsulta.fchIni;
        this.paramsServicioDatosLog.timeStampEnd        = paramsConsulta.fchFin;

        this.paramsServicioNumPaginas.ip[0]             = paramsConsulta.ip;
        this.paramsServicioDatosLog.ip[0]               = paramsConsulta.ip;

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post(this.url, this.nomServicioPaginas, this.paramsServicioNumPaginas, this.obtenNumeroDePaginasLog);


        //
        if (gNumPaginas > 0) {

            numPaginaObtenida = 0;
            if (ipAnterior != this.paramsServicioNumPaginas.ip[0]) {
                ipAnterior = this.paramsServicioNumPaginas.ip[0];
                this.numPaginas = 0;
            }

            // *** Llama al servicio remoto para obtener la información solicitada del Journal.
            // ** this.numPaginas = Esta variable contiene el número de paginas completas de la última consulta.
            // ** gNumPaginas = El número máximo de información.
            for (let idx = gNumPaginasCompletas; idx < gNumPaginas; idx++) {
                this.paramsServicioDatosLog.page = idx;
                //console.log("pDatosDelJournal::  this.paramsServicioDatosLog["+JSON.stringify(this.paramsServicioDatosLog)+"]");
                this._soapService.post(this.url, this.nomServicioDatosLog, this.paramsServicioDatosLog, this.obtenDatosJournal)
            }


            // Respalda el arreglo con las paginas completas (200 registros).
            console.log("gNumRegistros [" + gNumRegistros + "]   gNumPaginasCompletas[" + gNumPaginasCompletas + "]");
            if (gNumRegistros > 200 && (gNumPaginas - 1) > gNumPaginasCompletas) { // && arrDatosServidorBack.length == 0){
                arrDatosServidorBack = arrDatosServidor;
                /* la primera consulta */
            }

            arrDatosServidor = arrDatosServidorBack;

            gNumRegsProcesados = (arrDatosServidor.concat(arrDatosServidorInc)).length;
            this.obtenDatosLog(arrDatosServidor.concat(arrDatosServidorInc), gNumPaginas);

            if (arrDatosServidorInc.length > 0) {
                this.numPaginas = gNumPaginas - 1;
            }

            gNumPaginasCompletas = (gNumPaginas - 1);
        }else{
            this.obtenDatosLog([{}], gNumPaginas);
            this.cErroresPorBanco = [];
        }

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.dUltimaActualizacion = sprintf('%4d-%02d-%02d      %02d:%02d:%02d', _anioSys, _mesSys, _diaSys, _hraSys, _minSys, _segSys);
    }


    // Actualiza informciòn de la pantalla.

    public pActualizaInfo(): void {

        console.log("pActualizaInfo:: url["+this.rutaActual+"]");

        // Se obtiene el nombre de la clase actual:  this.constructor.name
        console.log("this.paramsServicioNumPaginas.ip["+this.paramsServicioNumPaginas.ip[0]+"]");
        if (ipAnterior != this.paramsServicioNumPaginas.ip[0] ||
            (gFchInicioAnterior != this.paramsServicioNumPaginas.timeStampStart ||
             gFchInicioFinAnterior != this.paramsServicioNumPaginas.timeStampEnd) ||
             gFchInicioAnterior != this.dFchFinProceso || gFchInicioFinAnterior != this.dHraFinProceso){

            ipAnterior              = this.paramsServicioNumPaginas.ip[0];
            gFchInicioAnterior      = this.paramsServicioNumPaginas.timeStampStart;
            gFchInicioFinAnterior   = this.paramsServicioNumPaginas.timeStampEnd;
            this.numPaginas         = 0;
            gNumRegsProcesados      = 0;
            arrDatosServidorBack    = [];
            gNumPaginas             = 0;
            gNumRegsProcesados      = 0;
            numPagsCompletas        = 0;
            gNumPaginasCompletas    = 0;
        }

        if (intervalId != null){
            clearInterval(intervalId);
        }

        this.pDatosDelJournal('');
    }


    public incrementaBanco(tipoOper:string, nomBanco:string): void{

        if (nomBanco == undefined || nomBanco == null || nomBanco == ""){
            nomBanco = "********";
        }
        
        if ( this.listaBancos[nomBanco] == undefined ){
            this.opersBanco            = {'nomBanco': nomBanco, 'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
            this.listaBancos[nomBanco] = {'opersBanco': {} };
        }else{
            this.opersBanco = this.listaBancos[nomBanco];
        }

        switch(tipoOper){
            case 'RE' : this.opersBanco['numRetOk']++; break;
            case 'REN': this.opersBanco['numRetNoOk']++; break;
            /*case 'REC': this.opersBanco['numRechazos']++; break;*/
            case 'CON': this.opersBanco['numCons']++; break;
            case 'COE': this.opersBanco['numConsNoOk']++; break;
            case 'REV': this.opersBanco['numReversos']++; break;
        }
        this.listaBancos[nomBanco] = this.opersBanco;
    }

    public obtenDatosLog(result:object, numPag:number): void {

        this.inicializaVariables();

        let datosLog                = JSON.parse(JSON.stringify(result));
        let fchSys                  = new Date();
        let _horaSys                = fchSys.getHours();
        let _horaUltimaOper         = _horaSys;
        let tmpFechaSys             = sprintf("%04d-%02d-%02d",fchSys.getFullYear(), fchSys.getMonth() +1, fchSys.getDate());
        let listaBancos             = {};
        let tipoUltimaOperacion     = "";
        let iniciaDeposito          = "";
        let terminaDeposito         = "";
        let montoDeposito           = 0;
        let id                      = 0;
        let numIntentos             = 0;
        let nivelUltimoDeposito     = 0;
        let datosDeposito           = "";
        let iniciaSesDeposito       = "";
        let dataAnterior            = "";
        let idSesion                = 1;
        let montoSesion             = 0;
        let numDepositos            = 0;
        let rollbackDeposito        = 0;                      // 0=Indica que no se provoco Rollback en el depósito / 1=Rollback en el deposito.
        let tmpArqc                 = "";
        let tmpAquirer              = "";
        let tmpCardNumber           = "";
        let tmpAuthId               = "";
        this.resumenPorBanco        = [0, 0, 0, 0, 0, 0, 0];

        var idxReg = 0;
        //var idxRegLog = 0;
        var iniciaDota = 0;
        this.veficaHoraUlimaOperacion(datosLog);
        this.dotacion.estado = "Pendiente";
        this.deposito.tiempoDowntime = "Pendiente";
        var fchTerminaDota:any;
        var fchIniciaDepDota:any;

        datosLog.forEach((reg)=>{

            let date = new Date(reg.TimeStamp);
            let fch=sprintf("%04d-%02d-%02d %02d:%02d:%02d", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            reg.TimeStamp = fch;
            let _hora = date.getHours();
            let tmpHoraOperacion = sprintf("%02d:%02d:%02d", date.getHours(), date.getMinutes(), date.getSeconds());
            let tmpFechaOper = sprintf("%04d-%02d-%02d", date.getFullYear(), date.getMonth() + 1, date.getDate());

            let xReg = reg
            xReg.TimeStamp = fch;

            fchSys = new Date();
            _horaSys = (tmpFechaOper != tmpFechaSys) ? 23 : fchSys.getHours();
            _horaUltimaOper = _horaSys;

            if (iniciaDeposito != "" && (tipoUltimaOperacion != "D" || (reg.Data == "VALIDAUSUARIO IsValid TRUE" && reg.Id != id))){ 
                iniciaDeposito      = "";
                terminaDeposito     = "";
                numIntentos         = 0;
                datosDeposito       = "";
                iniciaSesDeposito   = reg.TimeStamp;
                nivelUltimoDeposito = 0;
                montoSesion         = 0;
                numDepositos        = 0;
                rollbackDeposito    = 0;
                idSesion++;
            }

            switch(reg.Event) {

                // Retiros
                case "Withdrawal": { 
                    switch(reg.Data){
                        
                        case "Withdrawal DispenseOk": { 
                            this.dNumRetiros++;
                            this.dMontoRetiros += reg.Amount;

                            if(this.dHraPrimerRetiro == ""){
                                this.dHraPrimerRetiro = tmpHoraOperacion;
                            }
                            this.dHraUltimoRetiro = tmpHoraOperacion;
                            if (_hora < 7){
                                this.dNumRetirosPorHora[6]++;
                                this.dAcumNumRetirosPorHora[6]++;
                                this.dMontoRetirosPorHora     [6] += reg.Amount;
                                this.dAcumMontoRetirosPorHora[6]  += reg.Amount;
                            }else if(_hora <= _horaSys){
                                this.dNumRetirosPorHora[_hora]++;
                                this.dAcumNumRetirosPorHora[_hora]++;
                                this.dMontoRetirosPorHora     [_hora] += reg.Amount;
                                this.dAcumMontoRetirosPorHora[_hora]  += reg.Amount;
                            }
                            this.datosRetirosXhora[_hora].dNumRetirosPorHora++;
                            this.datosRetirosXhora[_hora].dAcumMontoRetirosPorHora += reg.Amount;
                            tipoUltimaOperacion = "R";

                            if (tmpArqc == reg.Arqc && tmpCardNumber == reg.CardNumber && tmpAuthId == reg.AuthId){
                                this.incrementaBanco('RE', tmpAquirer);
                                tmpArqc       = "";
                                tmpAquirer    = "";
                                tmpCardNumber = "";
                                tmpAuthId     = "";
                            }
                            this.arrTarjetas["i"+idxReg] = reg.CardNumber;
                            break;
                        }

                        case "Withdrawal Service Error": {
                            this.incrementaBanco('REN', tmpAquirer);
                            break;
                        }
                        case "Approved transaction": {
                            if (reg.SwitchResponseCode == 0 && reg.HWErrorCode == "Aprobado"){
                                tmpArqc       = reg.Arqc;
                                tmpAquirer    = reg.Aquirer;
                                tmpCardNumber = reg.CardNumber;
                                tmpAuthId     = reg.AuthId;
                            }
                            break;
                        }

                        case "Respuesta Servicio": {
                            if (reg.SwitchResponseCode == 0){
                                tmpAquirer = reg.Aquirer;
                            }else{
                                reg.Aquirer = "";
                            }
                            tmpArqc = reg.Arqc;
                            break;
                        }

                        case "Withdrawal DispenseFail": {
                            this.dMontoRetirosNoExito += reg.Amount;
                            if(this.dHraPrimerRetiroNoExito == ""){
                                this.dHraPrimerRetiroNoExito = tmpHoraOperacion
                            }
                            this.dHraUltimoRetiroNoExito = tmpHoraOperacion;
                            break;
                        }

                        case "Declined transaction": {
                            //this.dNumRetirosNoExito++;
                            this.dMontoRetirosNoExito += reg.Amount;
                            if(this.dHraPrimerRetiroNoExito == ""){
                                this.dHraPrimerRetiroNoExito = tmpHoraOperacion
                            }
                            this.dHraUltimoRetiroNoExito = tmpHoraOperacion;
                            break;
                        }

                        case "Withdrawal Reverse": {
                            this.dNumReversos++;
                            this.dMontoReversos += reg.Amount;
                            if(this.dHraPrimerReverso == ""){
                                this.dHraPrimerReverso = tmpHoraOperacion
                            }
                            this.dHraUltimoReverso = tmpHoraOperacion;
                            this.incrementaBanco('REV', reg.Aquirer);
                            break;
                        }
                    }

                    if (reg.SwitchResponseCode != 0){
                        this.incrementaBanco('REN', reg.Aquirer);
                        if ((reg.HWErrorCode in this.retiroNoOk) == true){
                            this.retiroNoOk[reg.HWErrorCode]++; // = this.retiroNoOk[reg.HWErrorCode] + 1;
                        } else {
                            this.retiroNoOk[reg.HWErrorCode] = 1;
                        }
                        if(reg.SwitchResponseCode == 54 || reg.SwitchResponseCode == 12 || reg.SwitchResponseCode == 1003 || reg.SwitchResponseCode == 62  || reg.SwitchResponseCode == 55  || reg.SwitchResponseCode == 38  || reg.SwitchResponseCode == 51){
                            tmpAquirer = reg.Aquirer;
                        }
                        this.incrementaErrorBanco(tmpAquirer, reg.HWErrorCode, reg.SwitchResponseCode, 'R');
                        this.dNumRetirosNoExito++;
                    }
                    if(reg.SwitchResponseCode < 1000) {
                        this.arrTarjetas["i"+idxReg] = reg.CardNumber;
                    }
                    break;
                }

                // Consultas
                case "BalanceCheck":

                    if(reg.SwitchResponseCode == 0){
                        this.dNumConsultas++;
                        this.dMontoConsultas += reg.Amount;

                        if(this.dHraPrimeraConsulta == ""){
                            this.dHraPrimeraConsulta = tmpHoraOperacion;
                        }
                        this.dHraUltimaConsulta = tmpHoraOperacion;
                        if (_hora < 7){
                            this.dNumConsPorHora[6]++;
                        }else{
                            this.dNumConsPorHora[_hora]++;
                        }

                        this.datosRetirosXhora[_hora].dNumConsPorHora++;
                        this.incrementaBanco('CON', reg.Aquirer);
                        tmpAquirer = reg.Aquirer;
                    }else{
                        this.dNumConsultasNoExito++;
                        this.dMontoConsultasNoExito += reg.Amount;

                        if(this.dHraPrimeraConsultaNoExito == ""){
                            this.dHraPrimeraConsultaNoExito = tmpHoraOperacion;
                        }
                        this.dHraUltimaConsultaNoExito = tmpHoraOperacion;
                        this.incrementaBanco('COE', reg.Aquirer);
                        this.incrementaErrorBanco(reg.Aquirer, reg.HWErrorCode, reg.SwitchResponseCode, 'C');
                    }
                    if(reg.SwitchResponseCode < 1000) {
                        this.arrTarjetas["i"+idxReg] = reg.CardNumber;
                    }
                    tipoUltimaOperacion = "C";
                    
                    break;
                    
                case "CASH MANAGEMENT": 

                    if (reg.Data == "VALIDAUSUARIO IsValid TRUE"){
                        iniciaDeposito = tmpHoraOperacion; //reg.TimeStamp;
                        if(this.dHraPrimerDeposito == ""){
                            this.dHraPrimerDeposito = tmpHoraOperacion;
                        }
                        this.dHraIniciaSesion = tmpHoraOperacion;
                    }

                    if (reg.Data.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito"){
                        this.dNumDepositos++;
                        this.dMontoDepositos += reg.Amount;
                        this.dHraUltimoDeposito = tmpHoraOperacion;

                        let denominaBilletes = this.pDenominacionesBilletes(reg.Data);

                        arrDepositos.push(
                            {
                                dId:        this.dNumDepositos,
                                dCta:       reg.AccountId,
                                dHraIni:    this.dHraIniciaSesion,
                                dHraFin:    tmpHoraOperacion,
                                dMonto:     reg.Amount,
                                dBill20:    denominaBilletes.b20,
                                dBill50:    denominaBilletes.b50,
                                dBill100:   denominaBilletes.b100,
                                dBill200:   denominaBilletes.b200,
                                dBill500:   denominaBilletes.b500,
                                dBill1000:  denominaBilletes.b1000,
                            }
                        );
                    }    
                    
                    if (reg.OperationType == "ControlMessage"){
                        if (reg.Data.substring(0,21) == "VALIDAUSUARIO IsValid"){
                            iniciaSesDeposito   = reg.TimeStamp;
                            iniciaDeposito      = reg.TimeStamp;
                            nivelUltimoDeposito = 1;
                            
                        } else if (reg.Data == "INPUTREFUSED ItemsTaken"){
                            numIntentos++;
                            nivelUltimoDeposito = 2;
                        } else if (reg.Data == "CASHINFAILED OnLoad"){

                        } else if (reg.Data == "CASHINFAILED RollbackOk"){
                            rollbackDeposito++;
                        }
                    }

                    if ((reg.OperationType == "CashManagement" && reg.Data.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito") ||
                        (reg.OperationType == "ControlMessage" && reg.Data == "CASHINFAILED ItemsTaken")){
                        dbDexie      = this._guardaDepositosBD.calculaTiempoDeposito(dbDexie, idSesion, 2, iniciaDeposito, reg.TimeStamp, numIntentos, reg.Amount, reg.Data, rollbackDeposito);
                        montoSesion += reg.Amount;
                        numIntentos  = 0;
                        numDepositos++;

                        if(iniciaDota == 3){
                            this.deposito.iniciaDeposito = this.dHraPrimerDeposito;
                            this.deposito.terminaDota = this.dotacion.terminaDota;
                            this.deposito.montoDowntime = reg.Amount;
                            fchIniciaDepDota = reg.TimeStamp;
                            this.deposito.iniciaDeposito = reg.TimeStamp.split(" ")[1];
                            this.deposito.tiempoDowntime = this.calculaDownTime(fchTerminaDota, fchIniciaDepDota,this.deposito.iniciaDeposito, this.deposito.terminaDota );
                            iniciaDota = 0;
                        }
                    }

                    dataAnterior        = reg.Data;
                    tipoUltimaOperacion = "D";
                    terminaDeposito     = reg.TimeStamp;
                    montoDeposito       = reg.Amount;
                                        
                    break;

                case "PinChange": 
                    if(reg.SwitchResponseCode == 0){
                        this.dNumCambioNIP++;
                        if(this.dHraPrimerCambioNIP == ""){
                            this.dHraPrimerCambioNIP = tmpHoraOperacion
                        }
                        this.dHraUltimoCambioNIP = tmpHoraOperacion;
                    }else{
                        this.dNumCambioNIPNoExito++;
                        if(this.dHraPrimerCambioNIPNoExito == ""){
                            this.dHraPrimerCambioNIPNoExito = tmpHoraOperacion
                        }
                        this.dHraUltimoCambioNIPNoExito = tmpHoraOperacion;
                        this.incrementaErrorBanco(reg.Aquirer, reg.HWErrorCode, reg.SwitchResponseCode, "P");
                    }
                    tipoUltimaOperacion = "P";
                    break;

                case "ADMIN":
                {

                    if(reg.AuthId == "LOGIN") {
                        iniciaDota = 1;
                        this.dotacion.iniciaDota = tmpHoraOperacion;
                        this.dotacion.estado = "En proceso";
                    }

                    if(reg.Data == "INICIO DOTACIÓN") {
                        iniciaDota = 2;
                    }
                    if (iniciaDota == 2){
                        if ( reg.Data != null ){
                            if(reg.Data.substring(0, 40) == "DOTAR CAPTURA CONTADORES - ANTES DE CERO") {
                                //[50x5|100x1|200x0|500x1087|][20x63|50x2|100x1|200x434|500x27|1000x29|][total=674610]
                                this.dotacion.monto = reg.Amount;
                            }
                        }
                        console.log("reg.Data["+reg.Data+"]");
                        if (reg.Data != null && reg.Data == "REGRESANDO A MODO ATM [AFD EXCHANGE ACTIVE TRUE] [CDM EXCHANGE ACTIVE FALSE]"){
                            this.dotacion.terminaDota   = tmpHoraOperacion;
                            this.dotacion.estado        = "Concluida";
                            iniciaDota                  = 3;
                            fchTerminaDota              = reg.TimeStamp;
                        }
                    }
                }
            }

            if (reg.Event == "CASH MANAGEMENT" && reg.Data == "VALIDAUSUARIO IsValid TRUE"){
                id = reg.Id
            }
            idxReg++;

        });

        this.mResumenOperaciones();
        this.mRretirosPorHora();
        this.mResumenPorBanco();
        this.pResumenDepositos();

        let idxx=0;

         for (var key in this.arrTarjetas) {
            let value = this.arrTarjetas[key];
            if( this.arrTarjetas[key] == '547146XXXXXX8650'){
                idxx = Number( key.substr(1));
                break;
            }
        }

        let idx = 0;
        let arrErrsBanco:any[] = [];
        Object.keys(this.listaErrsPorBanco).sort().forEach(function (banco) {
            let errsBanco = this[banco]

            for (let cve in errsBanco) {
                let codError = (cve.substring(cve.lastIndexOf("_"))).replace(/[\(\)_]/g,"");
                let cveError = cve.substring(0,cve.lastIndexOf("_(")).replace(/_/g," ");
                arrErrsBanco.push(new ErroresPorBanco(banco, cveError, Number(codError), errsBanco[cve], 'X'));
            }
        }, this.listaErrsPorBanco)

        this.cErroresPorBanco = arrErrsBanco;
    }


    calculaDownTime(fchInicial, fchFinal, horaInicial, horaFinal){

        let hora1 = (horaInicial).split(":");
        let hora2 = (horaFinal).split(":");

        let date1 = new Date();
        let date2 = new Date();
        let tiempoTranscurrido:string = "";

        date1.setHours(Number(hora1[0]), Number(hora1[1]), Number(hora1[2]));
        date2.setHours(Number(hora2[0]), Number(hora2[1]), Number(hora2[2]));

        date1.setHours(date1.getHours() - date2.getHours(),
            date1.getMinutes() - date2.getMinutes(),
            date1.getSeconds() - date2.getSeconds()
        );

        if (date1.getHours() > 1){
            tiempoTranscurrido +=sprintf("%sh. ",date1.getHours());
        }
        if (date1.getMinutes() > 1){
            tiempoTranscurrido +=sprintf("%sm. ",date1.getMinutes());
        }
        if (date1.getSeconds() > 1){
            tiempoTranscurrido +=sprintf("%ss. ",date1.getSeconds());
        }

        return(tiempoTranscurrido);
    }

    veficaHoraUlimaOperacion(datosLog){

        let tiempoSinOperacion  = (60 * 1000) * this.minutosSinOperacion;
        let reg:any             = datosLog[datosLog.length-1];
        let dateSys:any         = new Date().getTime();
        let dateOper            = new Date(reg.TimeStamp);
        let dateSist            = new Date();
        let tmpFechaOper        = sprintf("%04d-%02d-%02d", dateOper.getFullYear(), dateOper.getMonth() + 1, dateOper.getDate());
        let tmpFechaSist        = sprintf("%04d-%02d-%02d", dateSist.getFullYear(), dateSist.getMonth() + 1, dateSist.getDate());

        if (tmpFechaOper == tmpFechaSist) {
            this.tiempoSinOperaciones = Math.round(((dateSys - reg.TimeStamp) / 1000) / 60);

            console.log("Log: [" + reg.TimeStamp + "]   [" + new Date(reg.TimeStamp) + "]");
            console.log("Actual: [" + dateSys + "]   [" + new Date(dateSys) + "]");
            this.msgError = "";
            if ((dateSys - reg.TimeStamp) > tiempoSinOperacion) {
                console.log("**** No ha habido operaciones aproximadamente en " + this.tiempoSinOperaciones + " minutos ****");
                this.msgError = "**** No ha habido operaciones aproximadamente en " + this.tiempoSinOperaciones + " minutos ****";
            }
        }
    }


    incrementaErrorBanco(nomBanco, descError, codError, tipoOper){

        if (descError.length > 0) {
            if (nomBanco == undefined || nomBanco == null || nomBanco.length == 0){
                nomBanco = "********";
            }
            this.lErroresPorBanco[idxErrBanco++] = new ErroresPorBanco(nomBanco, descError, codError, 1, tipoOper);

            let desc = descError.replace(/ /g, "_")+"_("+codError+")";

            if (this.listaErrsPorBanco[nomBanco] == undefined) {
                this.listaErrsPorBanco[nomBanco] = []
                if (this.listaErrsPorBanco[nomBanco][desc] == undefined) {
                    this.listaErrsPorBanco[nomBanco][desc] = 1;
                } else {
                    this.listaErrsPorBanco[nomBanco][desc]++;
                }
            } else {
                if (this.listaErrsPorBanco[nomBanco][desc] == undefined) {
                    this.listaErrsPorBanco[nomBanco][desc] = 1;
                } else {
                    this.listaErrsPorBanco[nomBanco][desc]++;
                }
            }
        }
    }

    // Arma los datos de la tabla del Resumen de Operaciones
    mResumenOperaciones():void{

        this.tblResOperacion = {
            dataRows: [
                {etiqueta: "Depósitos Exitosos",     numOpers: this.dNumDepositos,        monto: this.dMontoDepositos,         primerMto: this.dHraPrimerDeposito,         ultimoMto: this.dHraUltimoDeposito},
                {etiqueta: "Retiros Exitosos",       numOpers: this.dNumRetiros,          monto: this.dMontoRetiros,           primerMto: this.dHraPrimerRetiro,           ultimoMto: this.dHraUltimoRetiro},
                {etiqueta: "Retiros No Exitosos*",   numOpers: this.dNumRetirosNoExito,   monto: this.dMontoRetirosNoExito,    primerMto: this.dHraPrimerRetiroNoExito,    ultimoMto: this.dHraUltimoRetiroNoExito},
                {etiqueta: "Consultas Exitosas",     numOpers: this.dNumConsultas,        monto: this.dMontoConsultas,         primerMto: this.dHraPrimeraConsulta,        ultimoMto: this.dHraUltimaConsulta},
                {etiqueta: "Consultas No Exitosas*", numOpers: this.dNumConsultasNoExito, monto: this.dMontoConsultasNoExito,  primerMto: this.dHraPrimeraConsultaNoExito, ultimoMto: this.dHraUltimaConsultaNoExito},
                {etiqueta: "Reversos",               numOpers: this.dNumReversos,         monto: this.dMontoReversos,          primerMto: this.dHraPrimerReverso,          ultimoMto: this.dHraUltimoReverso},
                {etiqueta: "Cambio NIP Exitoso",     numOpers: this.dNumCambioNIP,        monto: 0,                            primerMto: this.dHraPrimerCambioNIP,        ultimoMto: this.dHraUltimoCambioNIP},
                {etiqueta: "Cambio NIP Erroneo",     numOpers: this.dNumCambioNIPNoExito, monto: 0,                            primerMto: this.dHraPrimerCambioNIPNoExito, ultimoMto: this.dHraUltimoCambioNIPNoExito}
            ]
        };
    }

    // Arma los datos de la tabla del Depositos
    pResumenDepositos():void{

        this.tblResumenDepositos = {
            dataRows: arrDepositos
        };

        for(let idx=0; idx < arrDepositos.length; idx++){
            this.tBillDep[0].tMonto += Number(arrDepositos[idx].dMonto);
            this.tBillDep[0].tB20   += Number(arrDepositos[idx].dBill20);
            this.tBillDep[0].tB50   += Number(arrDepositos[idx].dBill50);
            this.tBillDep[0].tB100  += Number(arrDepositos[idx].dBill100);
            this.tBillDep[0].tB200  += Number(arrDepositos[idx].dBill200);
            this.tBillDep[0].tB500  += Number(arrDepositos[idx].dBill500);
            this.tBillDep[0].tB1000 += Number(arrDepositos[idx].dBill1000);
        }
    }

    // Arma la información de la tabla de Resumen de Operaciones por Banco
    mResumenPorBanco():void{


        let arrDatos = [];
        let arrTotDatos = [{fNumBancos: 0, fNumRetOk: 0, fNumRetNoOK: 0, fNumCons: 0, fNumConsNoOk: 0, fNumReversos: 0, fnumRechazos: 0}];
        let fNumBancos = 0;
        let fNumRetOk = 0;
        let fNumRetNoOK = 0;
        let fNumCons = 0;
        let fNumConsNoOk = 0;
        let fNumReversos = 0;
        let fnumRechazos = 0;
        Object.keys(this.listaBancos).sort().forEach(function(banco) {

            let datosBanco =  this[banco];
            arrDatos.push({ dBanco: banco,                          dNumRetOk: datosBanco['numRetOk'],
                            dNumRetNoOk: datosBanco['numRetNoOk'],  dNumCons: datosBanco['numCons'],
                            dNumConsNoOk: datosBanco['numConsNoOk'],dNumReversos: datosBanco['numReversos'],
                            dNumRechazos: datosBanco['numRechazos']
            });

            fNumBancos++;
            fNumRetOk += datosBanco['numRetOk'];
            fNumRetNoOK += datosBanco['numRetNoOk'];
            fNumCons += datosBanco['numCons'];
            fNumConsNoOk += datosBanco['numConsNoOk'];
            fNumReversos += datosBanco['numReversos'];
        }, this.listaBancos);

        this.tblResumenPorBanco = {
            dataRows: arrDatos,
            totalRows: [
                {   fNumBancos: "Total Bancos: "+fNumBancos, fNumRetOk: fNumRetOk, fNumRetNoOK: fNumRetNoOK,
                    fNumCons: fNumCons, fNumConsNoOk: fNumConsNoOk, fNumReversos: fNumReversos
                }
            ]
        };
    }

    // Despiega en la pagina la información de Consultas y Retiros.
    mRretirosPorHora():void{

        // Acumula los movimientos que se realizaron antes de la 7 de la mañana.
        let tNumRetiros         = 0;
        let tAcumNumRetiros     = 0;
        let tNumConsultas       = 0;
        let tAcumNumConsultas   = 0;
        let tMontoRetiros       = 0;
        let tAcumMontoRetiros   = 0;
        let tNumConsPorHora     = 0;
        let arrRetiros          = [];


        for(let idx=0; idx < 7; idx++){
            tNumConsultas += this.dNumConsPorHora[idx];
            tNumRetiros   += this.dNumRetirosPorHora[idx];
            if ( idx > 0){
                tAcumNumConsultas += this.dNumConsPorHora[idx] + this.dNumConsPorHora[idx -1];
                tAcumNumRetiros   += this.dNumRetirosPorHora[idx] + this.dNumRetirosPorHora[idx -1];
                tMontoRetiros     += this.dMontoRetirosPorHora[idx];
                tAcumMontoRetiros += this.dAcumMontoRetirosPorHora[idx -1] + this.dMontoRetirosPorHora[idx];
            }else{
                tNumConsultas      = this.dNumConsPorHora[idx];
                tAcumNumRetiros    = this.dNumRetirosPorHora[idx];
                tMontoRetiros      = this.dMontoRetirosPorHora[idx];
                tAcumMontoRetiros  = this.dAcumMontoRetirosPorHora[idx];
            }
        }

        // Agrega al objeto arrRetiros los movimientos que entraron antes de la 7 de la manañana
        let carVacio = "0";
        let tmpHora = "<7";
        arrRetiros.push(
        {
            hora:                    tmpHora,
            numConsultasPorHora:     tNumConsultas,
            acumNumConsultasPorHora: tAcumNumConsultas,
            numRetirosPorHora:       tNumRetiros,
            acumNumRetirosPorHora:   tAcumNumRetiros,
            montoRetirosPorHora:     tMontoRetiros,
            acumMontoRetirosPorHora: tAcumMontoRetiros
        });

        let acumCons:Array<number>  = new Array(24);
        let acumRet:Array<number>   = new Array(24);
        let acumMonto:Array<number> = new Array(24);


        for(let idx=0; idx < 24; idx++){
            acumCons[idx]   = (idx == 0) ? this.dNumConsPorHora[idx]        : this.dNumConsPorHora[idx]         + acumCons[idx -1];
            acumRet[idx]    = (idx == 0) ? this.dNumRetirosPorHora[idx]     : this.dNumRetirosPorHora[idx]      + acumRet[idx -1];
            acumMonto[idx]  = (idx == 0) ? this.dMontoRetirosPorHora[idx]   : this.dMontoRetirosPorHora[idx]    + acumMonto[idx -1];
        }

        // Agrega al objeto arrRetiros los movimientos que entraron despues de la 7 de la manañana
        for(let idx=7; idx < this.dAcumNumRetirosPorHora.length; idx++){
            if ( this.dNumConsPorHora[idx] > 0 || this.dNumRetirosPorHora[idx] > 0) {
                arrRetiros.push(
                {
                    hora:                       sprintf("%02s", idx.toString()),
                    numConsultasPorHora:        (this.dNumConsPorHora[idx] > 0 ? this.dNumConsPorHora[idx] : carVacio),
                    acumNumConsultasPorHora:    acumCons[idx],
                    numRetirosPorHora:          (this.dNumRetirosPorHora[idx] > 0 ? this.dNumRetirosPorHora[idx] : carVacio),
                    acumNumRetirosPorHora:      acumRet[idx],
                    montoRetirosPorHora:        (this.dMontoRetirosPorHora[idx] > 0 ? this.dMontoRetirosPorHora[idx] : carVacio),
                    acumMontoRetirosPorHora:    acumMonto[idx]
                });
            }
        }

        this.tblConsRetPorMes = {
            datos: arrRetiros
        };
    }

    //  Recupera la respueta del servicio xxx con el que se obtiene el número de paginas y registro del Journal
    obtenNumeroDePaginasLog(result:object, status){
        gNumPaginas   = JSON.parse(JSON.stringify(result)).TotalPages;
        gNumRegistros = JSON.parse(JSON.stringify(result)).TotalItems;
    }

    //  Recupera la respueta del servicio xxx con el que se obtiene ela información del Journal
    obtenDatosJournal(result:any[], status){

        arrDatosServidorInc = null;  // Bloque de paginas con menor a 200 registros.
        numPaginaObtenida++;         // Numero de paginas obtenidas.
        console.log("obtenDatosJournal:: Pagina: ["+numPaginaObtenida+"]   Renglones: ["+result.length+"]");
        //if (result.length >= 200){
        if (numPagsCompletas < (gNumPaginas -1)){
            numPagsCompletas++;      // Numero de paginas completas.
            if (arrDatosServidor == undefined){
                arrDatosServidor = result;
            }else{
                arrDatosServidor = arrDatosServidor.concat(result);
            }
        }else {
            arrDatosServidorInc = result;
        }

    }


    pDenominacionesBilletes(infoBilletes:string){

        let montoTotal      = 0;
        let respBilletes    = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, total: 0};
        let posInicial      = infoBilletes.indexOf('[');
        let posFinal        = infoBilletes.indexOf(']', posInicial);
        let billetes1       = infoBilletes.substr(posInicial, (posFinal - posInicial)).replace(/[\[\]]/g,'');
        let arrBilletes     = billetes1.split("|");

        for(let idx=0; idx < arrBilletes.length; idx++){
            let cantidad     = arrBilletes[idx].split("x")[0];
            let denomina     = arrBilletes[idx].split("x")[1];
            respBilletes['b'+denomina] = Number(cantidad);
            respBilletes.total += Number(denomina) * Number(cantidad);
        }
        return(respBilletes);
    }











    /*
    private _resOpersService: ResOpersService;
    _newResOpers: ResOpersModel = new ResOpersModel();
    _resOpers: Array<ResOpersModel> = [];
    nuevoResOpers = function () {
        this._service.insertReg(this._newResOpers).
        then(rowsAdded => {
            if (rowsAdded > 0) {
                this._resOpers.push(this._newResOpers);
                this.clearNewResOpers();
                alert('Successfully added');
            }
        }).catch(error => {
            console.error(error);
            alert(error.Message);
        });
    };

    clearNewResOpers = function () {
        this._newResOpers = new ResOpersModel();
    };
*/




}

function comparar ( a, b ){ return a - b; }

