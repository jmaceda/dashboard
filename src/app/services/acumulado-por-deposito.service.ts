/* app/services/detalle-atms-service.ts */

import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';

import { SoapService }      from './soap.service';

export var gDatosAcumDepositos;
export var gGrupos;
export var gDatosAtms;

var nomModulo = "DepositosPorTiendaService";

@Injectable()
export class DepositosPorTiendaService implements OnInit {

    constructor(public _soapService: SoapService){
        console.log(nomModulo+".constructor:: init");
    }

    public GetDepositCumulative(datosAtms:any, status){
        console.log(nomModulo+".GetDepositCumulative:: Inicio  ["+new Date()+"]");
        gDatosAcumDepositos = datosAtms;
    }


    public obtenGetDepositCumulative(filtrosConsulta:any) {

        console.log(nomModulo+".obtenGetDepositCumulative:: Parametros["+JSON.stringify(filtrosConsulta)+"]");

        let parameters = { startDate: filtrosConsulta.startDate, endDate: filtrosConsulta.endDate, store: filtrosConsulta.store};

        // Obtiene los datos de los Depositos de la tienda.
        this._soapService.post('', "GetDepositCumulative", parameters, this.GetDepositCumulative);

        let idx = 0;
        let arrDepositos:any[] = [];

        return(gDatosAcumDepositos);

    };

    public obtenUltimoCorte(filtrosConsulta:any){

        console.log(nomModulo+".obtenUltimoCorte:: Parametros["+JSON.stringify(filtrosConsulta)+"]");

        let fchInicioCons = new Date(filtrosConsulta.startDate);
        fchInicioCons.setDate(fchInicioCons.getDate() - 5);
        filtrosConsulta.startDate = fchInicioCons.getTime();

        let resDepositos:any    = this.obtenGetDepositCumulative(filtrosConsulta);
        let fchAnterior:any     = null;
        let fchActual:any       = null;
        let fchReciente:any     = null;
        let regUltimoCorte:any  = null;

        resDepositos.forEach( (reg) => {
           if( (reg.Date).substring(0,13) != "Pendiente ATM"){
               let fch      = ((reg.Date).split(" ")[0]).split("/");
               let hra      = (reg.Date).split(" ")[1];
               fch          = fch[2]+"-"+fch[1]+"-"+fch[0];
               fchActual    = new Date(fch + "T" + hra);

               if (fchAnterior == null){
                   fchAnterior = fchActual;
               }else if(fchAnterior < fchActual){
                   fchReciente = fchActual;
                   regUltimoCorte = reg;
               }
           }
        });

        console.log(nomModulo+".obtenUltimoCorte:: fchReciente["+fchReciente+"]");
        return(regUltimoCorte);
    }

    public GetGroupsWithAtms(datosGroups:any, status){
        gGrupos = datosGroups;
    }

    public obtenGetGroups(){

        this._soapService.post('', 'GetGroupsWithAtms', '', this.GetGroupsWithAtms);

        let arrNomGrupos:any[] = [];

        gGrupos.forEach((reg)=> {
            arrNomGrupos.push( (reg.Description));
        });
        console.log("InfoAtmsService.obtenGetGroups:: ["+arrNomGrupos+"]");
        return(gGrupos.sort(comparar));
    }


    public obtenIdGroup(descGpo){
        let idGpo = -1;

        if (gGrupos != null && gGrupos != "") {
            gGrupos.forEach((reg) => {
                if (idGpo == -1 && descGpo == reg.Description) {
                    idGpo = reg.Id;
                }
            });
        }

        return(idGpo);
    }

    public ngOnInit(){}

}

function comparar ( a, b ){ return a - b; }