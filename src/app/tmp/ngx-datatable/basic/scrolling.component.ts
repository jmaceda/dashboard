import { Component } from '@angular/core';

import { sprintf } from "sprintf-js";

import { SoapService } from '../../../services/soap.service';
import { FiltrosUtilsService } from '../../../services/filtros-utils.service';
import { CargaDatosLocalesService } from '../../../services/carga-datos-locales.service';

export const nomComponente:string = "HorzVertScrolling";
export var gDatosAtms:any[];

var arrDatosAtmsX:any[] = [];


@Component({
  selector: 'horz-vert-scrolling-demo',
  styleUrls: [
      './scrolling.component.css',
      "../../../../assets/icons.css",
      "../../../../assets/app.css",
      "../../../../assets/ngx-datatable/release/index.css",
      "../../../../assets/css/themes/material.css",
      "../../../../assets/ngx-datatable/release/assets/icons.css",
  '../../../../assets/css/themes/material.css',
  '../../../../assets/css/themes/dark.css',
  '../../../../assets/css/themes/bootstrap.css'
  ],
  templateUrl: 'scrolling.component.html',
  providers: [SoapService]
})
export class HorzVertScrolling {

  loadingIndicator: boolean = true;

  // Parametros para la pantalla de filtros para la consulta
  public dListaAtmGpos:any            = [];
  public dTipoListaParams:string      = "G";
  public dSolicitaFechasIni           = true;
  public dSolicitaFechasFin           = true;
  public dUltimaActualizacion:string;

  public intervalId                   = null;
  public tiempoRefreshDatos:number    = (1000 * 30 * 1); // Actualiza la información cada minuto.
  public pDatosParam:any              = {};
  public xtIsOnline:string            = "";
  public Titulo:string                = "";

  public arrDatosAtms = [];

  emptyMessage:string = "No existe información";
  rows = [];
  config:any;

  constructor(public _soapService: SoapService,
              public filtrosUtilsService: FiltrosUtilsService) {

    //this.config = this.cargaDatosLocalesService.leeArchivoLocal("assets/data/config.txt");

  }

  public parametrosConsulta(infoRecibida){
    let parametrosConsulta:any = {};

    let fIniParam = infoRecibida.fchInicio;
    let fFinParam = infoRecibida.fchFin;
    let idGpo     = infoRecibida.gpo;

    let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
        fIniParam.hour, fIniParam.min);

    console.log(nomComponente+".parametrosConsulta:: ["+fchIniParam+"]");

    let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
        fFinParam.hour, fFinParam.min);

    console.log(nomComponente+".parametrosConsulta:: ["+fchFinParam+"]");

    this.pDatosParam = {fchIni: fchIniParam, fchFin: fchFinParam, groupId: idGpo};

    this.pActualizaInfo();
  }

  // Actualiza informciòn de la pantalla.
  public pActualizaInfo(): void {

    console.log("pActualizaInfo::  Inicio");
    if (this.intervalId != null){
      clearInterval(this.intervalId);
    }

    this.obtenGetAtm();
    this.intervalId = setInterval(() => { this.obtenGetAtm(); }, this.tiempoRefreshDatos);
  }

  public obtenGetAtm() {

    /*
     if (this.urlPath != "atms"){
     console.log("obtenGetAtm:: No va a cargar los datos");
     return(0);
     }
     */

    let parameters = {  nemonico: -1, groupId: Number(this.pDatosParam.groupId), brandId: -1,
      modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1 };

    this._soapService.post('', "GetAtm", parameters, this.GetAtm, false);

    let idx = 0;
    this.arrDatosAtms = [];

    gDatosAtms.forEach(( reg )=> {
      //console.log(this.nomComponente + ".obtenGetAtm:: Id ATM["+reg.Id+"]");
      let tSafeOpen    = (reg.SafeOpen == false)    ? 'Cerrada' : 'Abierta';
      let tCabinetOpen = (reg.CabinetOpen == false) ? 'Cerrado' : 'Abierto';
      let tIsOnline    = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
      this.xtIsOnline  = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
      let tOffDispo    = (reg.OfflineDevices.length > 0) ? 'Error' : 'OK';

      // Recupera los datos efectivo del cajero
      let parameters = { atmId: reg.Id };

      this.arrDatosAtms[idx++] = {
        Description:                    reg.Description,
        Ip:                             reg.Ip,
        DeviceStatus:                   reg.DeviceStatus,
        IsOnline:                       tIsOnline,
        PaperStatus:                    reg.PaperStatus,
        SafeOpen:                       tSafeOpen,
        CabinetOpen:                    tCabinetOpen,
        CassetteAmount:                 reg.CassetteAmount,
        OfflineDevices:                 tOffDispo,

        ServiceDate:                    reg.ServiceDate,
        CassettesStatusTimestamp:       reg.CassettesStatusTimestamp,
        SafeOpenTs:                     reg.SafeOpenTs,
        CabinetOpenTs:                  reg.CabinetOpenTs,
        RetractStatusTimestamp:         reg.RetractStatusTimestamp,
        RejectStatusTimestamp:          reg.RejectStatusTimestamp,
        LastIOnlineTimestamp:           reg.LastIOnlineTimestamp,

        /*
         cassettero:                     gDatosEfectivoAtm.Device,
         denominacion:                   gDatosEfectivoAtm.Denomination,
         numBilletes:                    gDatosEfectivoAtm.Amount,
         montoTotal:                     (gDatosEfectivoAtm.Denomination * gDatosEfectivoAtm.Amount)
         */
      }


    });

    console.log(this.arrDatosAtms);

    //this.itemResource = new DataTableResource(arrDatosAtms);
    //this.itemResource.count().then(count => this.itemCount = count);
    //this.reloadItems( {limit: this.regsLimite, offset: 0});
    this.Titulo="";

    this.filtrosUtilsService.fchaHraUltimaActualizacion();

  }

  public GetAtm(datosAtms:any, status){
    console.log("GetAtm:: Inicio  ["+new Date()+"]");
    gDatosAtms = datosAtms;
  }

  /*
  updateFilter(event) {
    const val = event.target.value.toLowerCase();

// filter our data
    const temp = this.tasks.filter(function(d) {
      console.log(d.what_task.toLowerCase().indexOf(val) !== -1 || !val)
      return d.what_task.toLowerCase().indexOf(val) !== -1 || !val;
    });

// update the rows
    this.tableData= temp;

  }
  */
}
