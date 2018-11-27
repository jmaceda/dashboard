import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { OnDestroy }                            from '@angular/core';
import { ViewEncapsulation }                    from '@angular/core';
import { ViewChild }                            from '@angular/core';

import { NotificationsComponent }               from '../../notifications/notifications.component';

import { ChangeDetectorRef }                    from '@angular/core'
import { NgbModule } 							from '@ng-bootstrap/ng-bootstrap';


import { sprintf }                              from "sprintf-js";

import { SoapService }                          from '../../services/soap.service';
import { FiltrosUtilsService }                  from '../../services/filtros-utils.service';
import { DatosJournalService }                  from '../../services/datos-journal.service';
import { InfoAtmsService }                      from '../../services/info-atms.service';
import { LogHmaService }                        from '../../services/log-hma.service';
import { ExportToCSVService } 					from '../../services/export-to-csv.service';
import { SweetAlertService } 					from 'ngx-sweetalert2';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';


var arrDatosJournal:any[] = [];

export var datosATMs  = [];
export var gPaginasJournal:any;
export var gDatosJournal:any;


export const nomComponente:string = "VerCoreFlujoComponent";
export var gDatosAtms:any[];

var arrDatosAtmsX:any[] = [];


@Component({
  selector: 'app-journal',
  styleUrls: ['./ver-core-flujo.component.css'],
  templateUrl: './ver-core-flujo.component.html',
  providers: [SoapService, InfoAtmsService, LogHmaService, SweetAlertService, DatosJournalService],
  //encapsulation: ViewEncapsulation.None
})
export class VerCoreFlujoComponent implements OnInit  {

  // Parametros para la pantalla de filtros para la consulta
  public dListaAtmGpos:any            = [];
  public dTipoListaParams:string      = "G";
  public dSolicitaFechasIni           = true;
  public dSolicitaFechasFin           = true;
  public dUltimaActualizacion:string;

  public tituloImgExcel               = "Exporta Veresiones Pentomino a CVS";
  public tituloDatatable              = "Versión Flujo-Core";
  public regsLimite:number            = 20;
  public items                        = [];
  public itemCount                    = 0;
  public nomArchExcel                 = "VersApp_";
  public columnas:any;
  public datosVersionApps            = [];
  public isDatosVersiones:boolean       = false;
  private notificationsComponent: NotificationsComponent;

  selected = [];
  loadingIndicator: boolean = false;
  rawEvent: any;
  contextmenuRow: any;
  contextmenuColumn: any;

  constructor(public _soapService: SoapService,
              public filtrosUtilsService: FiltrosUtilsService,
			  public infoAtmsService: InfoAtmsService,
			  public logHmaService: LogHmaService,
              public datosJournalService: DatosJournalService,
			  private exportCVS: ExportToCSVService,
			  private _swal2: SweetAlertService,
              private _changeDetectorRef: ChangeDetectorRef){

    this.isDatosVersiones = !this.isDatosVersiones;
    this.notificationsComponent = new NotificationsComponent();

  }

  ngOnInit() {
    $('#btnExpExel2').css('cursor', 'not-allowed');
    this.isDatosVersiones = this.isDatosVersiones;
    this.columnas = this.datosJournalService.obtenColumnasVista();
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

		this.pDatosVersiones(paramsConsulta);

	}

  public pDatosVersiones(paramsConsulta){

        let idAtms:any[]            = this.infoAtmsService.obtenInfoAtmsOnLine();
        let msgValidaciones: any    = null;
        let tmpVerCore:any          = {};
        let tmpVerSP:any          = {};

        this.datosVersionApps   	= [];

        // Guardar info en Storage Windows
        // this.storage.store('boundValue', this.attribute);

		console.log("Aquí estoy");
        if(idAtms != null){
            idAtms.forEach( (reg) => {
                tmpVerCore = this.logHmaService.obtenVersionCore(paramsConsulta, {'Ip': reg.Ip});
                tmpVerSP = this.logHmaService.obtenVersionSP(paramsConsulta, {'Ip': reg.Ip});
				console.log("tmpVerSP.vSP<"+JSON.stringify(tmpVerSP.vSP)+">");
				let verSP1 = tmpVerSP.vSP.split(',')[0];
				let verSP2 = verSP1.split('-');
				verSP1 = verSP2[verSP2.length-1];
                this.datosVersionApps.push(this.datosJournalService.obtenVersionesPorAtm(paramsConsulta, {
                    'Description': reg.Description,
                    'Name': reg.Name,
                    'Ip': reg.Ip,
                    'fCore': tmpVerCore.fCore,
                    'vCore': tmpVerCore.vCore,
                    'fSP': tmpVerSP.fSP,
                    'vSP': verSP1,
					'vSPFull': tmpVerSP.vSP
                }));
            });

            if (this.datosVersionApps.length == 0)
                msgValidaciones = "No existe información de la fecha indicada";
        }else{
            msgValidaciones = "No existe información del grupo indicadado";
        }
console.log("datosVersionApps<"+JSON.stringify(this.datosVersionApps)+">");
        if (msgValidaciones != null){
            //his.notificationsComponent.showNotification('top','center', 'warning', msgValidaciones);
            this._swal2.info({
                title: msgValidaciones
            });
        }

        //sortByProperty(this.datosVersionApps, 'Description');

		if (this.datosVersionApps.length > 0) {
		  $('#btnExpExel2').css('cursor', 'pointer');
		  this.isDatosVersiones = !this.isDatosVersiones;
		}else{
		  $('#btnExpExel2').css('cursor', 'not-allowed');
		  this.isDatosVersiones = this.isDatosVersiones;
		}
		this.loadingIndicator = false;

		this.filtrosUtilsService.fchaHraUltimaActualizacion();
  }


  public GetEjaLogDataLength(paginasJournal:any, status){
    gPaginasJournal = paginasJournal;
    console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
  }

  public GetEjaLogPage(datosJournal:any, status){
    gDatosJournal = datosJournal;
  }

  reloadItems(params) {
    //this.itemResource.query(params).then(items => this.items = items);
  }

  // special properties:
  rowClick(rowEvent) {
    //console.log('Clicked: ' + rowEvent.row.item.name);
  }

  rowDoubleClick(rowEvent) {
    //alert('Double clicked: ' + rowEvent.row.item.name);
  }

  rowTooltip(item) { return item.jobTitle; }

  public exportaVesiones2Excel(){
    if ( this.datosVersionApps.length > 0) {
      $('#btnExpExel2').css('cursor', 'not-allowed');
      this.isDatosVersiones = !this.isDatosVersiones;

      console.log(nomComponente + ".exportaVesiones2Excel:: Inicio");
      this.notificationsComponent.showNotification('bottom', 'right', 'info', 'Exportado información del Journal a formato CVS');
      this.exportCVS.exportAsExcelFile("versiones-app", "idVersionesApp");
      console.log(nomComponente + ".exportaVesiones2Excel:: this.isDatosVersiones["+this.isDatosVersiones+"]");
      $('#btnExpExel2').css('cursor', 'pointer');
      this.isDatosVersiones = this.isDatosVersiones;
      console.log(nomComponente + ".exportaVesiones2Excel:: this.isDatosVersiones["+this.isDatosVersiones+"]");
    }
  }


  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);
  }

  onActivate(event) {
    console.log('Activate Event', event);
  }

  onTableContextMenu(contextMenuEvent) {
    console.log(contextMenuEvent);

    this.rawEvent = contextMenuEvent.event;
    if (contextMenuEvent.type === 'body') {
      this.contextmenuRow = contextMenuEvent.content;
      this.contextmenuColumn = undefined;
    } else {
      this.contextmenuColumn = contextMenuEvent.content;
      this.contextmenuRow = undefined;
    }

    contextMenuEvent.event.preventDefault();
    contextMenuEvent.event.stopPropagation();
  }

  /*
  toggleExpandRow(row) {
    //console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }
  */

  onDetailToggle(event) {
    //console.log('Detail Toggled', event);
  }

  cols = [
    {name: "#"},
    {prop: "TimeStamp", name: "Fecha/Hora"},
    {prop: "Ip", name: "IP"},
    {prop: "AtmName", name: "ATM"},
    {prop: "CardNumber", name: "Tarjeta número"},
    {prop: "OperationType", name: "Tipo de Operación"},
    {prop: "TransactionCount", name: "Contador de Transacción"},
    {prop: "Amount", name: "Monto"},
    {prop: "HWErrorCode", name: "Código de error de HW"},
    {prop: "Denomination", name: "Denominación"},
    {prop: "Aquirer", name: "Emisor"},
    {prop: "Event", name: "Evento"},
    {prop: "AccountId", name: "Cuenta Número"},
    {prop: "AccountType", name: "Tipo de Cuenta"},
    {prop: "Location", name: "Ubicación"},
    {prop: "Arqc", name: "ARQC"},
    {prop: "Arpc", name: "ARPC"},
    {prop: "FlagCode", name: "Flag Code"},
    {prop: "TerminalCaps", name: "Terminal Capabilities"},
    {prop: "PosMode", name: "POS Code"},
    {prop: "AuthId", name: "Id Autorización"},
    {prop: "SwitchAuthCode", name: "Código de Autorización del Switch"},
    {prop: "Surcharge", name: "Surcharge"},
    {prop: "SwitchResponseCode", name: "Código de Respuesta del Switch"},
    {prop: "Data", name: "Datos"},
    {prop: "Available", name: "Disponible"},
    {prop: "SwitchAtmId", name: "Switch ATM Id"},
    {prop: "Reference1", name: "Referencia 1"},
    {prop: "Reference2", name: "Referencia 2"},
    {prop: "Reference3", name: "Referencia 3"}
  ];

  tmpFnc(event,id){
    //console.log("tmpFnc");
  }
}
