import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { OnDestroy }                            from '@angular/core';
import { ViewEncapsulation }                    from '@angular/core';
import { ViewChild }                            from '@angular/core';

import { NotificationsComponent }               from '../../notifications/notifications.component';

import { ChangeDetectorRef }                    from '@angular/core'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { sprintf }                              from "sprintf-js";

import { SoapService }                          from '../../services/soap.service';
import { FiltrosUtilsService }                  from '../../services/filtros-utils.service';
import { DatosJournalService }                  from '../../services/datos-journal.service';

import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';


var arrDatosJournal:any[] = [];

export var datosATMs  = [];
export var gPaginasJournal:any;
export var gDatosJournal:any;


export const nomComponente:string = "JournalComponent";
export var gDatosAtms:any[];

var arrDatosAtmsX:any[] = [];


@Component({
  selector: 'app-journal',
  styleUrls: ['./journal.component.css'],
  templateUrl: './journal.component.html',
  providers: [SoapService, DatosJournalService],
  //encapsulation: ViewEncapsulation.None
})
export class JournalComponent implements OnInit  {

  // Parametros para la pantalla de filtros para la consulta
  public dListaAtmGpos:any            = [];
  public dTipoListaParams:string      = "A";
  public dSolicitaFechasIni           = true;
  public dSolicitaFechasFin           = true;
  public dUltimaActualizacion:string;

  public tituloImgExcel               = "Exporta archivo Journal a formato CVS";
  public tituloDatatable              = "Journal";
  public regsLimite:number            = 20;
  public items                        = [];
  public itemCount                    = 0;
  public nomArchExcel                 = "Journal_";
  public columnas:any;
  public dataJournalRedBlu            = [];
  public isDatosJournal:boolean       = false;
  private notificationsComponent: NotificationsComponent;

  selected = [];
  loadingIndicator: boolean = false;
  rawEvent: any;
  contextmenuRow: any;
  contextmenuColumn: any;

  constructor(public _soapService: SoapService,
              public filtrosUtilsService: FiltrosUtilsService,
              public datosJournalService: DatosJournalService,
              private _changeDetectorRef: ChangeDetectorRef,){

    this.isDatosJournal = !this.isDatosJournal;
    this.notificationsComponent = new NotificationsComponent();

  }

  ngOnInit() {
    $('#btnExpExel2').css('cursor', 'not-allowed');
    this.isDatosJournal = this.isDatosJournal;
    this.columnas = this.datosJournalService.obtenColumnasVista();
  }


  public parametrosConsulta(filtrosConsulta){

    let parametrosConsulta:any  = {};
    let fIniParam               = filtrosConsulta.fchInicio;
    let fFinParam               = filtrosConsulta.fchFin;
    let fchIniParam:string      = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
        fIniParam.hour, fIniParam.min);
    let fchFinParam:string      = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
        fFinParam.hour, fFinParam.min);
    let filtrosCons:any         = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: filtrosConsulta.atm};

    this.pDatosDelJournal(filtrosCons);
  }

  public pDatosDelJournal(filtrosCons){

    this.loadingIndicator = true;

    let paramsCons: any = {
      ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
      events: -1, minAmount: -1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
    };

    this.dataJournalRedBlu = [];

    console.log(nomComponente+".pDatosDelJournal:: paramsCons["+JSON.stringify(paramsCons)+"]");

    // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
    this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

    console.log(nomComponente+".pDatosDelJournal:: paramsCons["+JSON.stringify(paramsCons)+"]   gPaginasJournal["+gPaginasJournal+"]");

    if (gPaginasJournal.TotalPages > 0) {
      let datosJournal: any = [];
      for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
        paramsCons.page = idx;
        this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage, false);
        this.dataJournalRedBlu = this.dataJournalRedBlu.concat(gDatosJournal);

        this.dataJournalRedBlu.forEach( (reg) => {
          this.selected = [reg[2]];
        })
      }
    }

    if (this.dataJournalRedBlu.length > 0) {
      $('#btnExpExel2').css('cursor', 'pointer');
      this.isDatosJournal = !this.isDatosJournal;
    }else{
      $('#btnExpExel2').css('cursor', 'not-allowed');
      this.isDatosJournal = this.isDatosJournal;
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

  public exportaJournal2Excel(){
    if ( this.dataJournalRedBlu.length > 0) {
      $('#btnExpExel2').css('cursor', 'not-allowed');
      this.isDatosJournal = !this.isDatosJournal;

      console.log(nomComponente + ".exportaJournal2Excel:: Inicio");
      this.notificationsComponent.showNotification('bottom', 'right', 'info', 'Exportado información del Journal a formato CVS');
      this.datosJournalService.exportaJournal2Excel(this.dataJournalRedBlu);
      console.log(nomComponente + ".exportaJournal2Excel:: this.isDatosJournal["+this.isDatosJournal+"]");
      $('#btnExpExel2').css('cursor', 'pointer');
      this.isDatosJournal = this.isDatosJournal;
      console.log(nomComponente + ".exportaJournal2Excel:: this.isDatosJournal["+this.isDatosJournal+"]");
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
    console.log("tmpFnc");
  }
}
