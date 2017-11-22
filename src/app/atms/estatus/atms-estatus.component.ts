// app/atms/detalle-atms.component.ts
import { Component, OnInit } from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource } from 'angular-4-data-table';
import { sprintf }                                       from "sprintf-js";
import { SoapService } from '../../services/soap.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

var arrDatosAtms:any[] = [];
export var gDatosAtms:any[];



@Component({
    selector: 'atms-estatus-root',
    templateUrl: './atms-estatus.component.html',
    styleUrls: ['./atms-estatus.component.css'],
    providers: [SoapService]
})
export class AtmsEstatusComponent implements OnInit {

    public intervalId = null;
    public tiempoRefreshDatos:number = (1000 * 30 * 1); // Actualiza la información cada minuto.

    //public url: string                  = 'https://manager.redblu.com.mx:8080/services/dataservices.asmx';
    public url: string = '/dataservices.asmx'; //  QA
    //public url: string = '/services/dataservices.asmx'; // Prod
    public ambiente: string = "Producción"

    public xtIsOnline:string = "";
    public itemResource = new DataTableResource(arrDatosAtms);
    public items = [];
    public itemCount = 0;
    public Titulo:string;
    public rutaActual = "";
    public urlPath = "";
    public fchActual:any;

    public fechaActual(){
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

        console.log("AtmsEstatusComponent.ngOnInit:: Se va a cargar los datos");
        this.pActualizaInfo();
    }

    public GetAtm(datosAtms:any, status){

        console.log("GetAtm:: Inicio");
        gDatosAtms = datosAtms;
    }


    public obtenGetAtm() {

        console.log("AtmsEstatusComponent.obtenGetAtm -->"+this.urlPath+"<--");
        if (this.urlPath != "atms"){
            console.log("obtenGetAtm:: No va a cargar los datos");
            return(0);
        }

        let parameters = {
            nemonico: -1,
            groupId: -1,
            brandId: -1,
            modelId: -1,
            osId: -1,
            stateId: -1,
            townId: -1,
            areaId: -1,
            zipCode: -1
        };

        this._soapService.post(this.url, "GetAtm", parameters, this.GetAtm);

        let idx = 0;
        arrDatosAtms = [];

        gDatosAtms.forEach((reg)=> {
            let tSafeOpen = (reg.SafeOpen == false) ? 'Cerrada' : 'Abierta';
            let tCabinetOpen = (reg.CabinetOpen == false) ? 'Cerrado' : 'Abierto';
            let tIsOnline = (reg.IsOnline == true) ? 'Encendido' : 'Apagado';
            this.xtIsOnline = (reg.IsOnline == true) ? 'Encendido' : 'Apagado';
            let tOffDispo = (reg.OfflineDevices.length > 0) ? 'Error' : 'OK';

            arrDatosAtms[idx++] = {
                Description: reg.Description,
                Ip: reg.Ip,
                DeviceStatus: reg.DeviceStatus,
                IsOnline: tIsOnline,
                PaperStatus: reg.PaperStatus,
                SafeOpen: tSafeOpen,
                CabinetOpen: tCabinetOpen,
                CassetteAmount: reg.CassetteAmount,
                OfflineDevices: tOffDispo
            }
        });

        this.itemResource = new DataTableResource(arrDatosAtms);
        this.itemResource.count().then(count => this.itemCount = count);
        let ambiente = "QA"
        this.Titulo="Ambiente: "+ambiente+"      ("+this.fechaActual()+")";
        this.Titulo=sprintf("[%s] %s", this.fechaActual(), ambiente);
        this.Titulo=sprintf("[%s] %s %s", this.fechaActual(), "                 ", ambiente);
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

