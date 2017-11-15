// app/atms/detalle-atms.component.ts
import { Component, OnInit } from '@angular/core';

import { SoapService } from '../services/soap.service';


@Component({
    selector: 'atms-root',
    templateUrl: './atms.component.html',
    styleUrls: ['./atms.component.css'],
    providers: [SoapService]
})
export class AtmsComponent implements OnInit {

    //public url: string = '/services/dataservices.asmx';

    //constructor(public location: Location, public _soapService: SoapService) {
    //}

    ngOnInit() {
    }

/*
    public GetAtmsIps(result:any, status){

        console.log("GetAtmsIps:: Inicio");
        console.log(result)
    }

    public obtenDatosServidor() {

        let parameters = {
            atmsIds: '11.40.2.8'
        };

        this._soapService.post(this.url, "GetAtmDetail", parameters, this.GetAtmsIps);
    }
*/
}

