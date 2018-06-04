import { Component }                            from '@angular/core';
import { ViewEncapsulation }                    from '@angular/core';
import { ViewChild }                            from '@angular/core';
import { ChangeDetectorRef } from '@angular/core'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { sprintf }                              from "sprintf-js";

import { SoapService }                          from '../../../services/soap.service';
import { FiltrosUtilsService }                  from '../../../services/filtros-utils.service';
import { DatosJournalService }                  from '../../../services/datos-journal.service';

import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';

//import {NG_TABLE_DIRECTIVES} from 'ng2-table/ng2-table';
//import {NgTableSortingDirective} from './ng-table-sorting.directive';

// import {setProperty} from 'angular2/ts/src/core/forms/directives/shared';
/*
function setProperty(renderer:Renderer, elementRef:ElementRef, propName:string, propValue:any):void {
  renderer.setElementProperty(elementRef, propName, propValue);
}
*/

var arrDatosJournal:any[] = [];

export var datosATMs  = [];
export var gPaginasJournal:any;
export var gDatosJournal:any;


export const nomComponente:string = "HorzVertScrolling";
export var gDatosAtms:any[];

var arrDatosAtmsX:any[] = [];


@Component({
  selector: 'horz-vert-scrolling-demo',
  styleUrls: [
    './scrolling.component.css',
    /*
  '../../../../assets/css/themes/material.scss',
  '../../../../assets/css/themes/dark.scss',
  '../../../../assets/css/themes/bootstrap.scss',
    "../../../../assets/icons.css",
    "../../../../assets/ngx-datatable/release/index.css"
    */
    /*
    '../../../../assets/app.css'

    "../../../../assets/icons.css",
    "../../../../assets/ngx-datatable/release/index.css",
    '../../../../assets/css/themes/bootstrap.css',
    "../../../../assets/ngx-datatable/release/assets/icons.css",
    '../../../../assets/css/themes/material.css',
    '../../../../assets/css/themes/dark.css',
    */
      /*
       "../../../../assets/app.css",
       "../../../../assets/css/themes/material.css",
    */
  ],
  templateUrl: 'scrolling.component.html',
  providers: [SoapService, DatosJournalService],
  //encapsulation: ViewEncapsulation.None
})
export class HorzVertScrolling {

  //@ViewChild('mydatatable') table: any;

  // Parametros para la pantalla de filtros para la consulta
  public dListaAtmGpos:any            = [];
  public dTipoListaParams:string      = "A";
  public dSolicitaFechasIni           = true;
  public dSolicitaFechasFin           = true;
  public dUltimaActualizacion:string;

  public tituloImgExcel               = "Exporta archivo Journal a formato CVS";
  public tituloDatatable              = "Journal";
  public regsLimite:number            = 20;
  //public itemResource                 = new DataTableResource(arrDatosJournal);
  public items                        = [];
  public itemCount                    = 0;
  public nomArchExcel                 = "Journal_";
  public columnas:any;
  public dataJournalRedBlu            = [];
  private isDatosJournal:boolean      = false;

  selected = [];
  loadingIndicator: boolean = false;
  rawEvent: any;
  contextmenuRow: any;
  contextmenuColumn: any;
  expanded: any = {};

  totalRows: any = [];
  rows: any = [];

  constructor(public _soapService: SoapService,
              public filtrosUtilsService: FiltrosUtilsService,
              public datosJournalService: DatosJournalService,
              private _changeDetectorRef: ChangeDetectorRef,){

  }

  ngOnInit() {

    /*
    if ( $('#btnExpExel').length == 0) {
      $('.data-table-header').append('<input id="btnExpExel" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaJournal2Excel()">');
    }
    */
    $('#btnExpExel').css('cursor', 'not-allowed');
    this.isDatosJournal = true;
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
      //this.dataJournalRedBlu = datosJournal;
      this.totalRows = this.dataJournalRedBlu;
      this.data = this.dataJournalRedBlu;
      this.filteredData = this.dataJournalRedBlu;
    }

    if (this.dataJournalRedBlu.length > 0) {
      $('#btnExpExel').css('cursor', 'pointer');
      this.isDatosJournal = false;
    }else{
      $('#btnExpExel').css('cursor', 'not-allowed');
      this.isDatosJournal = true;
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
    console.log('Clicked: ' + rowEvent.row.item.name);
  }

  rowDoubleClick(rowEvent) {
    alert('Double clicked: ' + rowEvent.row.item.name);
  }

  rowTooltip(item) { return item.jobTitle; }

  public exportaJournal2Excel(event){
    console.log(nomComponente+".exportaJournal2Excel:: Inicio");
    this.datosJournalService.exportaJournal2Excel(this.dataJournalRedBlu);
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

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

  tmpFnc(event,id){
    console.log("tmpFnc");
  }

  getRowClass(row) {
    return {
      'es-retiro': row.Data === 'Withdrawal DispenseOk'
    };
  }

  otherFunc(row){
    //console.log("[" + row.Data + "]  --  " + (row.Data == 'Withdrawal DispenseOk'));
    return (row.Data == 'Withdrawal DispenseOk');
  };

  rowClass = (row) => {
    //console.log("[" + row.Data + "]  --  " + (row.Data == 'Withdrawal DispenseOk'));
    /*
      return {
        'es-retiro': this.otherFunc(row)
      };
      */
    return('es-retiro');
  };

  rowClassXX = (row) => {
    return {
      'some-class': (() => { return (row.Data == 'Withdrawal DispenseOk') })()
    };
  };


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



  filterData(event) {
    console.log(event);
    let columnName = event.currentTarget.id;
    const val = event.target.value.toLowerCase();
    const filteredData = this.totalRows.filter(function (d) {
      return d[columnName].toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = filteredData;
    this.table.offset = 0;
  }


  data = [];
  filteredData = [];
  dummyData = [];

// filters results
  filterDatatable(event){
    // get the value of the key pressed and make it lowercase
    let val = event.target.value.toLowerCase();
    // get the amount of columns in the table
    let colsAmt = this.cols.length;
    // get the key names of each column in the dataset
    let keys = Object.keys(this.dataJournalRedBlu[0]);
    // assign filtered matches to the active datatable
    this.data = this.filteredData.filter(function(item){
      // iterate through each row's column data
      for (let i=0; i<colsAmt; i++){
        // check for a match
        if (item[keys[i]].toLowerCase().indexOf(val) !== -1 || !val){
          // found match, return true to add to result set
          return true;
        }
      }
    });
    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

//import {Component, ViewChild} from '@angular/core';
//import {DatatableComponent} from '../../src/components/datatable.component';

  @ViewChild(DatatableComponent) table: DatatableComponent;

  /*
  updateFilterX(filter: string): void {

    const val = filter.trim().toLowerCase();

    this.filteredList = this.items.slice().filter((item: any) => {
      let searchStr = '';
      for (let i = 0; i < this.gridProperties.FilteredColumns.length; i++) {
        searchStr += (item[this.gridProperties.FilteredColumns[i]]).toString().toLowerCase();
      }
      return searchStr.indexOf(val) !== -1 || !val;
    });
  }
*/
  temp = [];
  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function(d) {
      return d.CardNumber.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.dataJournalRedBlu = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

}
