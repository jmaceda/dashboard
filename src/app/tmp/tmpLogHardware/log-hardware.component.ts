import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { OnDestroy }                            from '@angular/core';
//import { ViewEncapsulation }                    from '@angular/core';
//import { ViewChild }                            from '@angular/core';

import { NotificationsComponent }               from '../../notifications/notifications.component';

//import { ChangeDetectorRef }                    from '@angular/core'
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { sprintf }                              from "sprintf-js";

import { SoapService }                          from '../../services/soap.service';
import { FiltrosUtilsService }                  from '../../services/filtros-utils.service';
import { LogHmaService }                        from '../../services/log-hma.service';
import { SweetAlertService }                    from 'ngx-sweetalert2';

import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';


var arrDatosJournal:any[]               = [];
var nomComponente:string                = "LogHmaComponent";

export var gCatalogoEventos:any[]       = [];
export var gDevicesAtm:any[]            = [];
export var arrDatosServidor:any[]       = [];
export var gNumPagsLogHma               = 0;
export var gNumRegsLogHma               = 0;
export var gRespDatosLogHma:any;
@Component({
  selector: 'app-log-hma',
  styleUrls: ['./log-hardware.component.css'],
  templateUrl: './log-hardware.component.html',
  providers: [SoapService, LogHmaService],
})
export class LogHardwareComponent implements OnInit, OnDestroy  {

  // Parametros para la pantalla de filtros para la consulta
  public dListaAtmGpos:any            = [];
  public dTipoListaParams:string      = "A";
  public dSolicitaFechasIni           = true;
  public dSolicitaFechasFin           = true;
  public dUltimaActualizacion:string;

  //public itemResource             = new DataTableResource(arrDatosJournal);
  //public items                    = [];
  //public itemCount                = 0;
  public tituloImgExcel           = "Exporta archivo Journal a formato CVS";
  public tituloLogHMA:string      = "Log HMA";
  //public regsLimite: number       = 200;
  private datosRespLogHma:any[]   = [];
  private isDatosHMA:boolean      = false;
  public loadingIndicator         = false;
  public notificationsComponent: NotificationsComponent;

  public columns = [
    { prop: 'Ip',                name: 'IP'},
    { prop: 'TimeStamp',         name: 'Fecha/Hora'},
    { prop: 'Device',            name: 'Dispositivo' },
    { prop: 'Events',            name: 'Evento' },
    { prop: 'Data',              name: 'Parámetros' },
    { prop: 'AtmId',             name: 'AtmId' },
    { prop: 'HmaEventId',        name: 'HmaEventId' }
  ];

  selected = [];
  rawEvent: any;
  contextmenuRow: any;
  contextmenuColumn: any;

  constructor(public _soapService: SoapService,
              public filtrosUtilsService: FiltrosUtilsService,
              public logHmaService: LogHmaService,
              private _swal2: SweetAlertService){

    this.notificationsComponent = new NotificationsComponent();
  }

  ngOnInit() {
    gDevicesAtm      = this.logHmaService.GetHmaDevices();
    gCatalogoEventos = this.logHmaService.obtenEventos();
  }

  public ngOnDestroy() {
    if (gNumPagsLogHma > 0){
      gNumPagsLogHma = 0;
    }
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

    this.obtenDatosLogHMA(filtrosCons);
  }

  public obtenDatosLogHMA(filtrosCons){

    //this.loadingIndicator = true;

    let paramsCons: any = {
      ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd, events: -1, device: -1
    };

    console.log(nomComponente+".obtenDatosLogHMA:: paramsCons["+JSON.stringify(paramsCons)+"]");

    this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

    console.log(nomComponente+".obtenDatosLogHMA:: paramsCons["+JSON.stringify(paramsCons)+"]   gNumPagsLogHma["+gNumPagsLogHma+"]");

    this.datosRespLogHma = [];

    if (gNumPagsLogHma > 0) {
      for (let idx = 0; idx < gNumPagsLogHma; idx++) {
        paramsCons.page = idx;
        this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
        this.datosRespLogHma = this.datosRespLogHma.concat(gRespDatosLogHma);
      }

      let cveCat;
      this.datosRespLogHma.forEach( (reg) => {
        cveCat          = "c"+reg.HmaEventId;
        reg.Events      = gCatalogoEventos[cveCat];
        reg.DescDevice  = gDevicesAtm[reg.Device];
      });
    }

    if(gNumRegsLogHma == 0) {
      this.datosRespLogHma = [{}];
    }

    this.filtrosUtilsService.fchaHraUltimaActualizacion();

    if (this.datosRespLogHma.length > 0) {
      $('#btnExpHma2Exel').css('cursor', 'pointer');
      this.isDatosHMA = true;
    }else{
      this.notificationsComponent.showNotification('top','center', 'warning', 'No existe información en el Log de Hardware con los parámetros indicados');
      $('#btnExpHma2Exel').css('cursor', 'not-allowed');
      this.isDatosHMA = false;
    }
  }


  public GetHmaLogDataLength(respNumPaginasLogHma:object, status){
    gNumPagsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
    gNumRegsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
  }

  public GetHmaLogPage(respDatosLogHma:any[], status){
    gRespDatosLogHma = respDatosLogHma;
  }

  public exportaHMA2Excel(){
    if (this.datosRespLogHma.length > 0) {
      $('#btnExpHma2Exel').css('cursor', 'not-allowed');
      this.isDatosHMA = false;

      this.notificationsComponent.showNotification('bottom', 'right', 'info', 'Exportado información del log de HMA a formato CVS');
      this.logHmaService.exportaHMA2Excel(this.datosRespLogHma);

      $('#btnExpHma2Exel').css('cursor', 'pointer');
      this.isDatosHMA = true;
    }
  }

  tmpFnc(event,id){
    console.log("tmpFnc");
  }
}
