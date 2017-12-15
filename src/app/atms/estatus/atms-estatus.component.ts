// app/atms/detalle-atms.component.ts
import { Component, OnInit }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { Router }                                               from '@angular/router';
import { ActivatedRoute }                                       from '@angular/router';

var arrDatosAtms:any[] = [];
export var gDatosAtms:any[];
export var gDatosEfectivoAtm:any[];

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
        //console.log("AtmsEstatusComponent.GetAtm:: Inicio");
        //gDatosEfectivoAtm.push(datosAtms);
        gDatosEfectivoAtm = datosAtms;
    }

    obtenGetAtm() {

        console.log("AtmsEstatusComponent.obtenGetAtm -->"+this.urlPath+"<--");
        if (this.urlPath != "atms"){
            console.log("obtenGetAtm:: No va a cargar los datos");
            return(0);
        }

        //console.log("obtenGetAtm:: Se van a obtener los datos");

        let parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1 };

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetAtm", parameters, this.GetAtm);

        let idx = 0;
        arrDatosAtms = [];

        //console.log(JSON.stringify(gDatosAtms));

        gDatosAtms.forEach((reg)=> {
            //console.log(this.nomComponente + ".obtenGetAtm:: Id ATM["+reg.Id+"]");
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
        this.Titulo=sprintf("[%s] %s", this.horaActual(), ambiente);
        this.Titulo=sprintf("[%s] %s %s", this.horaActual(), "                 ", ambiente);
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
}

