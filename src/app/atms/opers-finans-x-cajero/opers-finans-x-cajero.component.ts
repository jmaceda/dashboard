// app/atms/detalle-atms.component.ts
import { Component, OnInit, OnDestroy }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { FiltrosUtilsService }                                  from '../../services/filtros-utils.service';
import { InfoAtmsService }                                      from '../../services/info-atms.service';
import { DatosJournalService }                                  from '../../services/datos-journal.service';
import { FiltrosConsultasComponent }                            from '../../shared/filtros-consultas/filtros-consultas.component';
import { UtilsService }                                         from '../../services/utils.service';
import { ExportToCSVService }                                   from '../../services/export-to-csv.service';

import { NotificationsComponent } from '../../notifications/notifications.component';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import { SweetAlertService } from 'ngx-sweetalert2';
//import swal from 'sweetalert2';

var arrDatosAtms:any[] = [];

export const nomComponente:string = "OpersFinansXCajeroComponent";
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
    selector: 'opers-financieras',
    templateUrl: './opers-finans-x-cajero.component.html',
    styleUrls: ['./opers-finans-x-cajero.component.css'],
    providers: [SoapService, InfoAtmsService, DatosJournalService, UtilsService, SweetAlertService]
})
export class OpersFinansXCajeroComponent implements OnInit, OnDestroy {

    // Filtros
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;

    public itemResource                 = new DataTableResource([]);
    public items                        = [];
    public itemCount                    = 0;

    public regsLimite:number            = 16;
    public intervalId                   = null;
    public tiempoRefreshDatos:number    = (1000 * 60 * 1); // Actualiza la información cada minuto.
    //public xtIsOnline:string            = "";
    public Titulo:string                = "";
    public opersFinanPorCajero:any[]       = [];
    private isDatosJournal:boolean      = false;
    private notificationsComponent: NotificationsComponent;
    private attribute: string = "atributos de esta clase";




    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public infoAtmsService: InfoAtmsService,
                public datosJournalService: DatosJournalService,
                public utilsService: UtilsService,
                private storage:LocalStorageService,
                private _swal2: SweetAlertService) {

        this.notificationsComponent = new NotificationsComponent();
    }

    public ngOnInit() {

        this.storage.observe('key')
            .subscribe((value) => console.log('new value', value));

    }

    public ngOnDestroy() {

        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }
    }

    public parametrosConsulta(filtrosConsulta) {
        let idGpo 					= filtrosConsulta.gpo;
        let fIniParam               = filtrosConsulta.fchInicio;
        let fFinParam               = filtrosConsulta.fchFin;
        let ipAtm                   = filtrosConsulta.gpo;
        let timeStampStart:string   = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let timeStampEnd:string     = sprintf("%04d-%02d-%02d-23-59", fFinParam.year, fFinParam.month, fFinParam.day);
        let paramsConsulta:any      = {
				'timeStampStart': timeStampStart, 
				'timeStampEnd': timeStampEnd,
                'ipAtm': filtrosConsulta.atm
		};

        this.pDatosDelJournal(paramsConsulta);

    }

    public pDatosDelJournal(paramsConsulta){

        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        let ftoFchSys:any = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any = /(\d+)\/(\d+)\/(\d+)/
        let fchSys:any    = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3$1$2');
        let fchParam:any  = (paramsConsulta.timeStampEnd.substring(0,10)).replace(/-/g,"");

        this.opersFinanPorCajero = [];
        this.itemResource = new DataTableResource(this.opersFinanPorCajero);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});

        this.datosDeOperacion(paramsConsulta);

    }

    private datosDeOperacion(paramsConsulta){
        let datosAtm:any;
        let idAtms:any        	= "";
        let numRetirosTiendas		= 0;
        let montoRetirosTiendas		= 0;
		let numConsultasTiendas		= 0;		
		let comisTotalTiendas   	= 0;
		let comisRetirosTiendas 	= 0;
		let comisConsultasTiendas	= 0;
        let depositosTotalTiendas   = 0;
        let numDepositosTiendas     = 0;
		let expRegText              = "^CI[0-9]{2}XX[0-9]{4}[0-9A-Za-z]*$";
		let regexTienda:any     	= new RegExp( expRegText.replace(/XX/g, "GT") );
		let regexPlaza:any      	= new RegExp( expRegText.replace(/XX/g, "GP") );
        let msgValidaciones: any    = null;
		let fchParam:any  			= (paramsConsulta.timeStampEnd.substring(0,10)).replace(/-/g,"");
        let ftoFchSys:any 			= {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any 			= /(\d+)\/(\d+)\/(\d+)/
        let fchSys:any    			= new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3$1$2');

        console.log("datosDeOperacion::  paramsConsulta["+JSON.stringify(paramsConsulta)+"]");
		this.opersFinanPorCajero   	= [];

		if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        let reg:any = {Description: 'Sta Lucia', Ip: paramsConsulta.ipAtm[0]};
		// Guardar info en Storage Windows
        // this.storage.store('boundValue', this.attribute);

        let finProceso:boolean  = true;
        let fchTmpProceso       = "";
        let fchTmpProceso2:any;
        let fchFinProceso:any   = paramsConsulta.timeStampEnd.substring(0,10);

        while(finProceso == true) {

            fchTmpProceso = paramsConsulta.timeStampStart.substring(0,10);
            paramsConsulta.timeStampEnd = sprintf("%10s-23-59", fchTmpProceso);
console.log("fchTmpProceso:: ["+fchTmpProceso+"]    fchFinProceso["+fchFinProceso+"]   Parametros para procesar: "+JSON.stringify(paramsConsulta));

                datosAtm = this.datosJournalService.obtenComisionesPorAtm(paramsConsulta, {
							'Description': fchTmpProceso,
							'descAtm': reg.Name, 
							'Ip': paramsConsulta.ipAtm
                });

                if ( (datosAtm.numConsultas + datosAtm.numRetiros + datosAtm.numDepositos) > 0) {
                    this.opersFinanPorCajero.push(datosAtm);

					if ( regexTienda.test(datosAtm.idAtm) ){
                        numRetirosTiendas       += datosAtm.numRetiros;
                        montoRetirosTiendas     += datosAtm.montoRetiros;
						comisRetirosTiendas 	+= datosAtm.comisionesRetiros;
						numConsultasTiendas     += datosAtm.numConsultas;
						comisConsultasTiendas 	+= datosAtm.comisionesConsultas;
						comisTotalTiendas 		+= datosAtm.totalComisiones;
                        depositosTotalTiendas   += datosAtm.montoDepositos;
                        numDepositosTiendas     += datosAtm.numDepositos;
					}
                    this.itemResource = new DataTableResource(this.opersFinanPorCajero);
                    this.itemResource.count().then(count => this.itemCount = count);
                    this.reloadItems({limit: this.regsLimite, offset: 0});
                }

                finProceso = ( fchTmpProceso == fchFinProceso ) ? false : true;

                if( finProceso == true) {
                    fchTmpProceso2 = new Date(fchTmpProceso.replace(/-/g, "/"));
                    fchTmpProceso2 = new Date(fchTmpProceso2.setDate(fchTmpProceso2.getDate() + 1));
                    paramsConsulta.timeStampStart = sprintf("%04d-%02d-%02d-00-00", fchTmpProceso2.getFullYear(), fchTmpProceso2.getMonth()+1, fchTmpProceso2.getDate());
                }
                console.log("timeStampStart["+paramsConsulta.timeStampStart+"]");
        }

        if (this.opersFinanPorCajero.length == 0) {
            msgValidaciones = "No existe información de la fecha indicada";
        } else {


            if (msgValidaciones != null) {
                //his.notificationsComponent.showNotification('top','center', 'warning', msgValidaciones);
                this._swal2.info({
                    title: msgValidaciones
                });
            }

            console.log("Se va a realizar el acumulado de cifras");
            if (comisTotalTiendas > 0) {
                this.opersFinanPorCajero.sort(this.utilsService.sort_by('Description', false));
                this.opersFinanPorCajero.push({
                    'Description': 'Comisiones Tiendas',
                    'numRetiros': numRetirosTiendas,
                    'montoRetiros': montoRetirosTiendas,
                    'comisionesRetiros': comisRetirosTiendas,
                    'numConsultas': numConsultasTiendas,
                    'comisionesConsultas': comisConsultasTiendas,
                    'totalComisiones': comisTotalTiendas,
                    'numDepositos': numDepositosTiendas,
                    'montoDepositos': depositosTotalTiendas
                });
            }

            if ($('#btnExpOpersCajeroExel').length == 0) {
                $('div.button-panel[_ngcontent-c6]').append('<input id="btnExpOpersCajeroExel" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaComisPorCajeroExcel()">');
            }

            if (this.opersFinanPorCajero.length > 0) {
                $('#btnExpOpersCajeroExel').css('cursor', 'pointer');
                this.isDatosJournal = false;
            } else {
                $('#btnExpOpersCajeroExel').css('cursor', 'not-allowed');
                this.isDatosJournal = true;
            }

            console.log("Se va a cargar el buffer para mostrar los datos de la pantalla");
            if (this.opersFinanPorCajero.length > 0) {
                this.itemResource = new DataTableResource(this.opersFinanPorCajero);
                this.itemResource.count().then(count => this.itemCount = count);
                this.reloadItems({limit: this.regsLimite, offset: 0});
                this.filtrosUtilsService.fchaHraUltimaActualizacion();
            }
            this.opersFinanPorCajero = [];
            console.log("Termina proceso");
        }

    }

    private reloadItems(params){
        this.itemResource.query(params).then(items => this.items = items);
    }

    private rowClick(rowEvent) {}

    private rowDoubleClick(rowEvent) {}

    private rowTooltip(item) {}

    private exportaComisiones2Excel(event){}

    private getColor(Description){
		let styles:any = {};

		if (Description == "Comisiones Tiendas" || Description == "Comisiones Plazas"){
			styles = {'font-weight': 'bold', 'color': 'blue'};
		}
		return styles;
	}


    public exportaComisPorCajeroExcel(datosComisionPorCajeroRedBlu){
        console.log(nomComponente+".exportaComisPorCajeroExcel:: Inicio");
        let arr2Excel:any[] = [];
        let tmpFchHora:any;
        let tmpMonto:any;
        let tmpMontoDisponible:any;
        let ftoFecha:any    = {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
        let ftoFchSys:any   = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let ftoHora:any     = {hour: '2-digit', minute: '2-digit', second: '2-digit'};

        this.opersFinanPorCajero.forEach((reg)=> {
            tmpFchHora          = new Date(reg.TimeStamp).toLocaleString(undefined, ftoFecha);
            tmpMonto            = reg.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
            tmpMontoDisponible  = reg.Available.toLocaleString("es-MX",{style:"currency", currency:"MXN"});

            arr2Excel.push(
                {
                    "Fecha":           	                    tmpFchHora,
                    "IP":                   	            reg.Ip,
                    "ATM":                  	            reg.AtmName,

                }
            )
        });

        if (arr2Excel.length > 0) {
            let exporter = new ExportToCSVService();
            exporter.exportAllToCSV(arr2Excel, 'Journal.csv');
        }

        return(true);
    }


}
