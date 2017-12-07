// app/atms/detalle-atms.component.ts
import { Component, OnInit } from '@angular/core';

import { SoapService }              from '../services/soap.service';



@Component({
    selector: 'atms-root',
    templateUrl: './atms.component.html',
    styleUrls: ['./atms.component.css'],
    providers: [SoapService],
    /*entryComponents: [AtmsEstatusComponent, ResumenCifrasComponent]*/
})
export class AtmsComponent implements OnInit {

    public url: string = '/services/dataservices.asmx';

    constructor(public _soapService: SoapService) {
    }

    ngOnInit() {
        //this.obtenGetAtm();
    }


    public GetAtmMoneyStat(result:any, status){

        console.log("GetAtmMoneyStat:: Inicio");
        console.log(JSON.stringify(result));
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


    public GetAtm(result:any, status){

        console.log("GetAtm:: Inicio");
        console.log(JSON.stringify(result));
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
    }

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

}

