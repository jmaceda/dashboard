// app/atms/detalle-atms.component.ts
import { Component, OnInit }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { Router }                                               from '@angular/router';
import { ActivatedRoute }                                       from '@angular/router';
import { FiltrosUtilsService }                                  from '../../services/filtros-utils.service';

import { ParamsAtmsComponent }                                  from '../params-atms/params-atms.component';

var arrDatosAtms:any[] = [];
export var gDatosAtms:any[];
export var gDatosEfectivoAtm:any[];

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
    providers: [SoapService]
})
export class AtmsEstatusComponent implements OnInit {

    public dListaAtmGpos:any = [];
    public dTipoListaParams:string = "G";
    public dUltimaActualizacion:string;
    public regsLimite:number = 15;

    public intervalId                   = null;
    public tiempoRefreshDatos:number    = (1000 * 30 * 1); // Actualiza la información cada minuto.
    public ambiente: string             = "Producción"

    public xtIsOnline:string            = "";
    public itemResource                 = new DataTableResource(arrDatosAtms);
    public items                        = [];
    public itemCount                    = 0;
    public Titulo:string                = "";
    public rutaActual                   = "";
    public urlPath                      = "";
    public fchActual:any;


    gGetGroupsAtmIds: GetGroupsAtmIds[] = gGetGroupsAtmIds;

    public horaActual(){
        let fechaSys = new Date();
        return(sprintf("%4d:%02d:%02d",fechaSys.getHours(), (fechaSys.getMinutes() + 1), fechaSys.getSeconds()));
    }

    constructor(public _soapService: SoapService,
                private router: Router,
                public activatedRoute: ActivatedRoute,
                public filtrosUtilsService: FiltrosUtilsService) {

        this.activatedRoute.url.subscribe(url => {
            this.urlPath = url[0].path;
            console.log("AtmsEstatusComponent.constructor:: -->" + this.urlPath + "<--");
        });
    }

    // Actualiza informciòn de la pantalla.
    pActualizaInfo(): void {

        console.log("pActualizaInfo::  Inicio");
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        this.obtenGetAtm();
        this.intervalId = setInterval(() => { this.obtenGetAtm(); }, this.tiempoRefreshDatos);
    }

    ngOnInit() {

        if (this.urlPath != "atms"){
            return(0);
        }
    }

    GetAtm(datosAtms:any, status){
        console.log("GetAtm:: Inicio  ["+new Date()+"]");
        gDatosAtms = datosAtms;
    }

    GetStoreTotals(){

    }

    obtenerTotalesPorTienda(){

    }

    nomComponente = "AtmsEstatusComponent";

    GetAtmMoneyStat(datosAtms:any, status){
        gDatosEfectivoAtm = datosAtms;
    }

    obtenGetAtm() {

        if (this.urlPath != "atms"){
            console.log("obtenGetAtm:: No va a cargar los datos");
            return(0);
        }

        let parameters = { nemonico: -1, groupId: Number(this.pDatosParam.groupId), brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1 };

        this._soapService.post('', "GetAtm", parameters, this.GetAtm);

        let idx = 0;
        arrDatosAtms = [];

        gDatosAtms.forEach(( reg )=> {
            //console.log(this.nomComponente + ".obtenGetAtm:: Id ATM["+reg.Id+"]");
            let tSafeOpen    = (reg.SafeOpen == false)    ? 'Cerrada' : 'Abierta';
            let tCabinetOpen = (reg.CabinetOpen == false) ? 'Cerrado' : 'Abierto';
            let tIsOnline    = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
            this.xtIsOnline  = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
            let tOffDispo    = (reg.OfflineDevices.length > 0) ? 'Error' : 'OK';

            // Recupera los datos efectivo del cajero
            let parameters = { atmId: reg.Id };

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
            }


        });

        this.itemResource = new DataTableResource(arrDatosAtms);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});
        this.Titulo="";

        this.filtrosUtilsService.fchaHraUltimaActualizacion();

    };

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

    rowTooltip(item) { return item.jobTitle; }

    parametrosConsulta(infoRecibida){
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

    public pDatosParam:any = {};

    GetGroupsAtmsIps(datosGroups:any, status){
        console.log("TotalesPorTiendaComponent.GetGroupsAtmsIps:: ["+JSON.stringify(datosGroups)+"]");
    }

    obtenGetGroupsAtmsIps(){

        let parametros:any = {groupsIds: ['-1']};
        this._soapService.post('', 'GetGroupsAtmsIps', parametros, this.GetGroupsAtmsIps);
    }

    GetGroupsAtmIds(datosGroups:any, status){

        gGetGroupsAtmIds = [];
        datosGroups.forEach((reg)=> {
            gGetGroupsAtmIds.push({
                Id: reg.Id,
                Description: reg.Description
            });
        })

    }

    obtenGruposDeATMs(){

        this._soapService.post('', 'GetGroup', '', this.GetGroupsAtmIds);

        console.log("TotalesPorTiendaComponent.obtenGruposDeATMs:: ["+JSON.stringify(gGetGroupsAtmIds)+"]");

        this.obtenGetGroupsAtmsIps();
    }

}

