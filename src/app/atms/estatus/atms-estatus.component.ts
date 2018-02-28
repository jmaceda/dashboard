// app/atms/detalle-atms.component.ts
import { Component, OnInit, OnDestroy }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
//import { Router }                                               from '@angular/router';
//import { ActivatedRoute }                                       from '@angular/router';
import { FiltrosUtilsService }                                  from '../../services/filtros-utils.service';
import { LogHmaService }                                from '../../services/log-hma.service';
//import { FiltrosConsultasComponent }                            from '../../shared/filtros-consultas/filtros-consultas.component';

var arrDatosAtms:any[] = [];
export var gDatosAtms:any[];
export var gDatosEfectivoAtm:any[];
export var gDevicesAtm:any[]            = [];
export const nomComponente:string = "AtmsEstatusComponent";

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
    selector: 'atms-estatus-root',
    templateUrl: './atms-estatus.component.html',
    styleUrls: ['./atms-estatus.component.css'],
    providers: [SoapService, LogHmaService]
})
export class AtmsEstatusComponent implements OnInit, OnDestroy {

    // Filtros
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "G";
    public dSolicitaFechasIni           = false;
    public dSolicitaFechasFin           = false;
    public dUltimaActualizacion:string;

    public regsLimite:number            = 15;
    public intervalId                   = null;
    public tiempoRefreshDatos:number    = (1000 * 30 * 1); // Actualiza la información cada minuto.
    public xtIsOnline:string            = "";
    public itemResource                 = new DataTableResource(arrDatosAtms);
    public items                        = [];
    public itemCount                    = 0;
    public Titulo:string                = "";


    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public logHmaService: LogHmaService) {
    }

    public ngOnInit() {
        gDevicesAtm         = this.logHmaService.GetHmaDevices();
    }

    public ngOnDestroy() {
        if (this.intervalId != null){
            console.log(nomComponente+".ngOnDestroy:: ngOnDesroy()");
            clearInterval(this.intervalId);
        }
    }

    public parametrosConsulta(filtrosConsulta){

        let parametrosConsulta:any = {};
        let idGpo     = filtrosConsulta.gpo;
        let filtrosCons = {idGpo: idGpo};

        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        this.obtenGetAtm(filtrosCons);
        this.intervalId = setInterval(() => { this.obtenGetAtm(filtrosCons); }, this.tiempoRefreshDatos);
    }

    // Atualiza informciòn de la pantalla.
    public pActualizaInfo(filtrosCons): void {

        console.log("pActualizaInfo::  Inicio");
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        this.obtenGetAtm(filtrosCons);
        this.intervalId = setInterval(() => { this.obtenGetAtm(filtrosCons); }, this.tiempoRefreshDatos);
    }


    public obtenGetAtm(filtrosCons) {

        let paramsCons = {  nemonico: -1, groupId: Number(filtrosCons.idGpo), brandId: -1,
                            modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1 };

        this._soapService.post('', "GetAtm", paramsCons, this.GetAtm, false);

        let idx = 0;
        arrDatosAtms = [];
        let arrDevicesOffline = [];

        //console.log(JSON.stringify(gDatosAtms));
        gDatosAtms.forEach(( reg )=> {
            let tSafeOpen    = (reg.SafeOpen == false)    ? 'Cerrada' : 'Abierta';
            let tCabinetOpen = (reg.CabinetOpen == false) ? 'Cerrado' : 'Abierto';
            let tIsOnline    = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
            this.xtIsOnline  = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
            let tOffDispo    = (reg.OfflineDevices.length > 0) ? 'Error' : 'OK';

            // Recupera los datos efectivo del cajero
            let parameters = { atmId: reg.Id };

            if ( reg.OnlineDevices.length > 0 ){
                for(let cve in reg.OnlineDevices) {
                    arrDevicesOffline.push(gDevicesAtm[reg.OnlineDevices[cve]]);
                }
            }

            arrDatosAtms[idx++] = {
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
                dispositios: arrDevicesOffline
            };

            arrDevicesOffline = [];



        });

        this.itemResource = new DataTableResource(arrDatosAtms);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});
        this.Titulo="";

        this.filtrosUtilsService.fchaHraUltimaActualizacion();

    }

    public GetAtm(datosAtms:any, status){
        console.log("GetAtm:: Inicio  ["+new Date()+"]");
        gDatosAtms = datosAtms;
    }

    reloadItems(params) {
        console.log("reloadItems::");
        this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item, x?, y?) {
        return item.jobTitle;
    }

}

