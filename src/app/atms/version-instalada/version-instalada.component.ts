// app/atms/detalle-atms.component.ts
import { Component, OnInit, OnDestroy }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { FiltrosUtilsService }                                  from '../../services/filtros-utils.service';
import { InfoAtmsService }                                      from '../../services/info-atms.service';
import { DatosJournalService }                                  from '../../services/datos-journal.service';
import { LogHmaService }                                        from '../../services/log-hma.service';
import { FiltrosConsultasComponent }                            from '../../shared/filtros-consultas/filtros-consultas.component';
import { UtilsService }                                         from '../../services/utils.service';

import { NotificationsComponent } from '../../notifications/notifications.component';

import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import { SweetAlertService } from 'ngx-sweetalert2';
import { ExportToCSVService } from '../../services/export-to-csv.service';

//import swal from 'sweetalert2';

var arrDatosAtms:any[] = [];

export const nomComponente:string = "OpersFinancierasComponent";
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
    templateUrl: './version-instalada.component.html',
    styleUrls: ['./version-instalada.component.css'],
    providers: [SoapService, InfoAtmsService, DatosJournalService, UtilsService, SweetAlertService, LogHmaService, ExportToCSVService]
})
export class VersionInstaladaComponent implements OnInit, OnDestroy {

    // Filtros
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "G";
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
    public datosVersionesApp:any[]       = [];
    private isDatosJournal:boolean      = false;
    private notificationsComponent: NotificationsComponent;
    private attribute: string = "atributos de esta clase";




    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public infoAtmsService: InfoAtmsService,
                public datosJournalService: DatosJournalService,
                public logHmaService: LogHmaService,
                public utilsService: UtilsService,
                private storage:LocalStorageService,
                private exportCVS: ExportToCSVService,
                private _swal2: SweetAlertService) {

        this.notificationsComponent = new NotificationsComponent();
    }

    public ngOnInit() {

        this.storage.observe('key')
            .subscribe((value) => console.log('new value', value));

    }

    public ngOnDestroy() {

        /*
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }
        */
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
				'idGpo': idGpo
		};

        this.pDatosDelJournal(paramsConsulta);

    }

    public pDatosDelJournal(paramsConsulta){

        /*
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }
        */

        let ftoFchSys:any = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any = /(\d+)\/(\d+)\/(\d+)/
        let fchSys:any    = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3$1$2');
        let fchParam:any  = (paramsConsulta.timeStampEnd.substring(0,10)).replace(/-/g,"");

        this.datosVersionesApp = [];
        this.itemResource = new DataTableResource(this.datosVersionesApp);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});

        this.datosDeOperacion(paramsConsulta);

    }

    private datosDeOperacion(paramsConsulta){

        let idAtms:any[]            = this.infoAtmsService.obtenInfoAtmsOnLine();
        let msgValidaciones: any    = null;
        let tmpVerCore:any          = {};
		let tmpVerSP:any          = {};

        this.datosVersionesApp   	= [];

        // Guardar info en Storage Windows
        // this.storage.store('boundValue', this.attribute);

        if(idAtms != null){
            idAtms.forEach( (reg) => {
                tmpVerCore = this.logHmaService.obtenVersionCore(paramsConsulta, {'Ip': reg.Ip});
				tmpVerSP = this.logHmaService.obtenVersionSP(paramsConsulta, {'Ip': reg.Ip});
				console.log("tmpVerSP<"+JSON.stringify(tmpVerSP)+">");
                this.datosVersionesApp.push(this.datosJournalService.obtenVersionesPorAtm(paramsConsulta, {
                    'Description': reg.Description,
                    'Name': reg.Name,
                    'Ip': reg.Ip,
                    'fCore': tmpVerCore.fCore,
                    'vCore': tmpVerCore.vCore,
					'fSP': tmpVerSP.fSP,
                    'vSP': tmpVerSP.vSP.substring(52,18)
                }));
            });

            if (this.datosVersionesApp.length == 0)
                msgValidaciones = "No existe información de la fecha indicada";
        }else{
            msgValidaciones = "No existe información del grupo indicadado";
        }

        if (msgValidaciones != null){
            //his.notificationsComponent.showNotification('top','center', 'warning', msgValidaciones);
            this._swal2.info({
                title: msgValidaciones
            });
        }

        //sortByProperty(this.datosVersionesApp, 'Description');
        //const resultsByObjectId = sortByProperty(this.datosVersionesApp, 'attributes.OBJECTID');

        console.log("Se va a realizar el acumulado de cifras");

        if ($('#btnExpExel3').length == 0) {
            $('div.button-panel[_ngcontent-c6]').append('<input id="btnExpExel3" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaVersiones2Excel($event)">');
        }

        if (this.datosVersionesApp.length > 0) {
            $('#btnExpExel3').css('cursor', 'pointer');
            this.isDatosJournal = false;
        }else{
            $('#btnExpExel3').css('cursor', 'not-allowed');
            this.isDatosJournal = true;
        }
        //console.log("(1) datosVersionesApp:: "+JSON.stringify(this.datosVersionesApp));
        console.log("Se va a cargar el buffer para mostrar los datos de la pantalla");

        if(this.datosVersionesApp.length > 0) {
            //console.log("(2) datosVersionesApp:: "+JSON.stringify(this.datosVersionesApp));
            this.itemResource = new DataTableResource(this.datosVersionesApp);
            this.itemResource.count().then(count => this.itemCount = count);
            this.reloadItems({limit: this.regsLimite, offset: 0});
            this.filtrosUtilsService.fchaHraUltimaActualizacion();
        }
        //this.datosVersionesApp = [];
        console.log("Termina proceso");

    }

    private reloadItems(params){
        this.itemResource.query(params).then(items => this.items = items);
    }

    private rowClick(rowEvent) {}

    private rowDoubleClick(rowEvent) {}

    private rowTooltip(item) {}

    private getColor(Description){
		let styles:any = {};

		if (Description == "Comisiones Tiendas" || Description == "Comisiones Plazas"){
			styles = {'font-weight': 'bold', 'color': 'blue'};
		}
		return styles;
	}

    //
    private exportaVersiones2Excel(){
        //if ( this.dataJournalRedBlu.length > 0) {
            $('#btnExpExel3').css('cursor', 'not-allowed');
            this.isDatosJournal = !this.isDatosJournal;

            console.log(nomComponente + ".exportaJournal2Excel:: Inicio");
            this.notificationsComponent.showNotification('bottom', 'right', 'info', 'Exportado información del Journal a formato CVS');
            this.exportCVS.exportAsExcelFile("versiones-app", "idVersionesApp");
            console.log(nomComponente + ".exportaJournal2Excel:: this.isDatosJournal["+this.isDatosJournal+"]");
            $('#btnExpExel3').css('cursor', 'pointer');
            this.isDatosJournal = this.isDatosJournal;
            console.log(nomComponente + ".exportaJournal2Excel:: this.isDatosJournal["+this.isDatosJournal+"]");
        //}
    }
}


function sortJsonArrayByProperty(objArray, prop, direction){
    if (arguments.length<2) throw new Error("sortJsonArrayByProp requires 2 arguments");
    var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
    if (objArray && objArray.constructor===Array){
        var propPath = (prop.constructor===Array) ? prop : prop.split(".");
        objArray.sort(function(a,b){
            for (var p in propPath){
                if (a[propPath[p]] && b[propPath[p]]){
                    a = a[propPath[p]];
                    b = b[propPath[p]];
                }
            }
            // convert numeric strings to integers
            a = a.match(/^\d+$/) ? +a : a;
            b = b.match(/^\d+$/) ? +b : b;
            return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
        });
    }
}

function sortByProperty(objArray, prop, direction){
    if (arguments.length<2) throw new Error("ARRAY, AND OBJECT PROPERTY MINIMUM ARGUMENTS, OPTIONAL DIRECTION");
    if (!Array.isArray(objArray)) throw new Error("FIRST ARGUMENT NOT AN ARRAY");
    const clone = objArray.slice(0);
    const direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
    const propPath = (prop.constructor===Array) ? prop : prop.split(".");
    clone.sort(function(a,b){
        for (let p in propPath){
            if (a[propPath[p]] && b[propPath[p]]){
                a = a[propPath[p]];
                b = b[propPath[p]];
            }
        }
        // convert numeric strings to integers
        a = a.match(/^\d+$/) ? +a : a;
        b = b.match(/^\d+$/) ? +b : b;
        return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
    });
    return clone;
}