// app/atms/detalle-atms.component.ts
import { Component, OnInit }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
//import { DataTableResource }                  from 'angular-4-data-table-bootstrap-4';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { Router }                                               from '@angular/router';
import { ActivatedRoute }                                       from '@angular/router';

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
    public regsLimite:number            = 20;
    public dUltimaActualizacion         = "";

    gGetGroupsAtmIds: GetGroupsAtmIds[] = gGetGroupsAtmIds;


    public horaActual(){
        let fechaSys = new Date();
        return(sprintf("%4d:%02d:%02d",fechaSys.getHours(), (fechaSys.getMinutes() + 1), fechaSys.getSeconds()));
    }

    constructor(public _soapService: SoapService,
                private router: Router,
                public activatedRoute: ActivatedRoute) {
                //private activatedRoute : ActivatedRoute

        console.log("AtmsEstatusComponent.constructor:: Inicia");
        this.activatedRoute.url.subscribe(url => {
            this.urlPath = url[0].path;
            console.log("AtmsEstatusComponent.constructor:: -->" + this.urlPath + "<--");
        });
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

    ngOnInit() {

        console.log("AtmsEstatusComponent.ngOnInit -->"+this.urlPath+"<--");
        if (this.urlPath != "atms"){
            console.log("AtmsEstatusComponent.ngOnInit:: No va a cargar los datos");
            return(0);
        }
        this.obtenGruposDeATMs();
        console.log("AtmsEstatusComponent.ngOnInit:: Se van a cargar los datos");
        this.pActualizaInfo();
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
        console.log("AtmsEstatusComponent.GetAtm:: Inicio");
        //gDatosEfectivoAtm.push(datosAtms);
        gDatosEfectivoAtm = datosAtms;
    }

    obtenGetAtm() {

        console.log("AtmsEstatusComponent.obtenGetAtm -->"+this.urlPath+"<--");
        if (this.urlPath != "atms"){
            console.log("obtenGetAtm:: No va a cargar los datos");
            return(0);
        }

        console.log("obtenGetAtm:: Se van a obtener los datos");

        let parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1 };

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetAtm", parameters, this.GetAtm);

        let idx = 0;
        arrDatosAtms = [];

        //console.log(JSON.stringify(gDatosAtms));

        gDatosAtms.forEach((reg)=> {
            console.log(this.nomComponente + ".obtenGetAtm:: Id ATM["+reg.Id+"]");
            let tSafeOpen    = (reg.SafeOpen == false)    ? 'Cerrada' : 'Abierta';
            let tCabinetOpen = (reg.CabinetOpen == false) ? 'Cerrado' : 'Abierto';
            let tIsOnline    = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
            this.xtIsOnline  = (reg.IsOnline == true)     ? 'Encendido' : 'Apagado';
            let tOffDispo    = (reg.OfflineDevices.length > 0) ? 'Error' : 'OK';

            // Recupera los datos efectivo del cajero
            let parameters = { atmId: reg.Id };
            this._soapService.post('', "GetAtmMoneyStat", parameters, this.GetAtmMoneyStat);

            //console.log(JSON.stringify(gDatosEfectivoAtm));


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

        /*
        gDatosEfectivoAtm = [];
        gDatosAtms.forEach( (reg) => {
            // Llama al servicio GetAtmMoneyStat con atmId = gDatosAtms.Id
            let parameters = { atmId: reg.Id };
            this._soapService.post('', "GetAtmMoneyStat", parameters, this.GetAtmMoneyStat);
        });
        console.log(gDatosEfectivoAtm);
         */
        // Obtiene los datos del log de hardware para detectar problemas con los cassetteros.

        this.itemResource = new DataTableResource(arrDatosAtms);
        this.itemResource.count().then(count => this.itemCount = count);
        let ambiente = (window.location.port == '8687') ? "PROD" : "QA";
        this.Titulo="Ambiente: "+ambiente+"      ("+this.horaActual()+")";
        //this.Titulo=sprintf("[%s] %s", this.horaActual(), ambiente);
        //this.Titulo=sprintf("[%s] %s %s", this.horaActual(), "                 ", ambiente);

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.dUltimaActualizacion = sprintf('%4d-%02d-%02d      %02d:%02d:%02d', _anioSys, _mesSys, _diaSys, _hraSys, _minSys, _segSys);


    };

    reloadItems(params) {
        console.log("reloadItems::");
        this.itemResource.query(params).then(items => this.items = items);
        this.pActualizaInfo();
    }

    // special properties:

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }

    parametrosConsulta(infoRecibida){
       // console.log(nomComponente+".parametrosConsulta:: Se va mostrar la información enviada desde el componente Params");
       // console.log(nomComponente+".parametrosConsulta:: Params recibidos: ["+JSON.stringify(infoRecibida)+"]");
       // console.log(nomComponente+".parametrosConsulta:: Se mostro la información enviada desde el componente Params");
        let parametrosConsulta:any = {};

        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        let ipParam   = infoRecibida.atm;

        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);

        console.log(nomComponente+".parametrosConsulta:: ["+fchIniParam+"]");

        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);

        console.log(nomComponente+".parametrosConsulta:: ["+fchFinParam+"]");

        let datosParam:any = {fchIni: fchIniParam, fchFin: fchFinParam, ip: ipParam};

        //this.nomArchExcel = "Journal_" + ipParam + "_" + (new Date().toLocaleDateString("es-MX")).replace(/\//g,"-") + ".csv";
        //console.log("nomArchExcel:: "+this.nomArchExcel);

        //this.pDatosDelJournal(datosParam);
    }

    GetGroupsAtmsIps(datosGroups:any, status){
        console.log("TotalesPorTiendaComponent.GetGroupsAtmsIps:: ["+JSON.stringify(datosGroups)+"]");
    }

    obtenGetGroupsAtmsIps(){

        let parametros:any = {groupsIds: ['-1']};
        this._soapService.post('', 'GetGroupsAtmsIps', parametros, this.GetGroupsAtmsIps);
    }

    GetGroupsAtmIds(datosGroups:any, status){

        //console.log("TotalesPorTiendaComponent.GetGroupsAtmIds:: ["+JSON.stringify(datosGroups)+"]");
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

