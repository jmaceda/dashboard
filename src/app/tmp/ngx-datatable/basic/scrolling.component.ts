import { Component }                            from '@angular/core';

import { sprintf }                              from "sprintf-js";

import { SoapService }                          from '../../../services/soap.service';
import { FiltrosUtilsService }                  from '../../../services/filtros-utils.service';
import { DatosJournalService }                  from '../../../services/datos-journal.service';


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
  providers: [SoapService, DatosJournalService]
})
export class HorzVertScrolling {

  // Parametros para la pantalla de filtros para la consulta
  public dListaAtmGpos:any            = [];
  public dTipoListaParams:string      = "A";
  public dSolicitaFechasIni           = true;
  public dSolicitaFechasFin           = true;
  public dUltimaActualizacion:string;

  public regsLimite:number            = 15;
  //public itemResource                 = new DataTableResource(arrDatosJournal);
  public items                        = [];
  public itemCount                    = 0;
  public nomArchExcel                 = "Journal_";
  public columnas:any;
  public dataJournalRedBlu            = [];
  private isDatosJournal:boolean      = false;

  selected = [];

  constructor(public _soapService: SoapService,
              public filtrosUtilsService: FiltrosUtilsService,
              public datosJournalService: DatosJournalService){
  }

  ngOnInit() {
    if ( $('#btnExpExel').length == 0) {
      $('.data-table-header').append('<input id="btnExpExel" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaJournal2Excel()">');
    }

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

    let paramsCons: any = {
      ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
      events: -1, minAmount: -1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
    };

    this.dataJournalRedBlu = [];

    // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
    this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

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
    }

    if (this.dataJournalRedBlu.length > 0) {
      $('#btnExpExel').css('cursor', 'pointer');
      this.isDatosJournal = false;
    }else{
      $('#btnExpExel').css('cursor', 'not-allowed');
      this.isDatosJournal = true;
    }

    //this.itemResource = new DataTableResource(this.dataJournalRedBlu);
    //this.itemResource.count().then(count => this.itemCount = count);
    //this.reloadItems( {limit: this.regsLimite, offset: 0});

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


}
