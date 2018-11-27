/* app/services/filtros-utils.service.ts */

import { Injectable }                           from '@angular/core';
import { OnInit }                               from '@angular/core';
import { sprintf }                              from "sprintf-js";

var nomModulo:string = "FiltrosUtilsService";

@Injectable()
export class FiltrosUtilsService implements OnInit {

    constructor(){}

    ngOnInit(){}

    public fchaHraUltimaActualizacion(){

        let fchSys              = new Date();
        let _anioSys            = fchSys.getFullYear();
        let _mesSys             = fchSys.getMonth()+1;
        let _diaSys             = fchSys.getDate();
        let _hraSys             = fchSys.getHours();
        let _minSys             = fchSys.getMinutes();
        let _segSys             = fchSys.getSeconds();
        let ultimaActualizacion = sprintf('%4d-%02d-%02d      %02d:%02d:%02d', _anioSys, _mesSys, _diaSys, _hraSys, _minSys, _segSys);

        $("#idFchHraUltimaActual").val(ultimaActualizacion);

        ultimaActualizacion = sprintf('%02d/%02d/%4d %d:%02d:%02d', _diaSys, _mesSys, _anioSys,  _hraSys, _minSys, _segSys);

        return(ultimaActualizacion);
    }
}