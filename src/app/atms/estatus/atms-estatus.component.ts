// app/atms/detalle-atms.component.ts
import { Component, OnInit } from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource } from 'angular-4-data-table-bootstrap-4';

import { SoapService } from '../../services/soap.service';
import {ifTrue} from "codelyzer/util/function";

var arrDatosAtms:any[] = [];
export var gDatosAtms:any[];

@Component({
    selector: 'atms-estatus-root',
    templateUrl: './atms-estatus.component.html',
    styleUrls: ['./atms-estatus.component.css'],
    providers: [SoapService]
})
export class AtmsEstatusComponent implements OnInit {

    public url: string = '/services/dataservices.asmx';
    public ambiente: string = "Producción"


    itemResource = new DataTableResource(arrDatosAtms);
    items = [];
    itemCount = 0;

    constructor(public _soapService: SoapService) {
    }

    ngOnInit() {
        this.obtenGetAtm();
    }


    public GetAtmMoneyStat(datosAtms:any, status){

        console.log("GetAtmMoneyStat:: Inicio");
        console.log(JSON.stringify(datosAtms));

        let idx = 0;
        datosAtms.forEach((reg)=> {

            arrDatosAtms[idx] = {Description: reg.Description, Ip: reg.Ip, Name: reg.Name, IsOnline: reg.IsOnline, }

        });

        this.itemResource.count().then(count => this.itemCount = count);

    }

    public obtenGetAtmMoneyStat() {

        let parameters = {
            atmId: 16281584
        };

        this._soapService.post(this.url, "GetAtmMoneyStat", parameters, this.GetAtmMoneyStat);
    }


    public GetAtmDetail(result:any, status){

        console.log("GetAtmDetail:: Inicio");
        console.log(JSON.stringify(result));
    }

    public obtenGetAtmDetail() {

        let parameters = {
            atmId: 16281584
        };

        this._soapService.post(this.url, "GetAtmDetail", parameters, this.GetAtmDetail);
    }


    public GetAtm(datosAtms:any, status){

        console.log("GetAtm:: Inicio");
        //console.log(JSON.stringify(datosAtms));

        gDatosAtms = datosAtms;

    }

    public obtenGetAtm() {

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
        gDatosAtms.forEach((reg)=> {
            let tSafeOpen = (reg.SafeOpen == false) ? 'Cerrada' : 'Abierta';
            let tCabinetOpen = (reg.CabinetOpen == false) ? 'Cerrado' : 'Abierto';
            let tIsOnline = (reg.IsOnline == true) ? 'Encendido' : 'Apagado';

            arrDatosAtms[idx++] = {
                Description: reg.Description, Ip: reg.Ip, Name: reg.Name, IsOnline: tIsOnline,
                PaperStatus: reg.PaperStatus, SafeOpen: tSafeOpen, CabinetOpen: tCabinetOpen,
                CassetteAmount: reg.CassetteAmount, IsInMaintenanceMode: reg.IsInMaintenanceMode
            }
        });

        this.itemResource = new DataTableResource(arrDatosAtms);
        this.itemResource.count().then(count => this.itemCount = count);

    }

    cellColor(line){
        console.log(line.IsOnline);
        if(line.IsOnline == 'Apagado'){
            return 'rgb(237, 28, 53)';
        }
        //return color; //(line.IsOnline == false) ? "red" : "black"; //color; //'rgb(255, 255,' + (155 + Math.floor(100 - ((car.rating - 8.7)/1.3)*100)) + ')';
    };

    // Ip y Clave de ATMs

    public GetEjaFilters(result:any, status){

        var ipATM = '';
        console.log(JSON.stringify(result));
/*
        for(let idx = 0; idx < result.length; idx++){
            for(let idx2 = 0; idx2 < result[idx].length; idx2++){
                if(idx === 0){
                    ipATM = result[idx][idx2];
                    this.ipATMs[this.ipATMs.length] = result[idx][idx2];
                }else{
                    datosATMs.push(result[idx][idx2] + "    ("+ result[0][idx2] + ")");
                }
            }
        }
        */
    }
    ipATMs:any[]  = [];
    public obtieneIpATMs(){
        //console.log('obtenIpATMs:: Inicio');
        //this.ipATMs  = [];
        this._soapService.post(this.url, 'GetEjaFilters', '', this.GetEjaFilters);
        //this.ipATMs = ipATMs;
        //this.ipATMs = ipATMs.sort(comparar);
        //console.log('obtenIpATMs:: Se ejecuto la consulta');
    }


    reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
        this.obtenGetAtm();
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

