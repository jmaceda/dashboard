// app/atms/detalle-atms.component.ts
import { Component, OnInit, OnDestroy }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { FiltrosUtilsService }                                  from '../../services/filtros-utils.service';
import { InfoAtmsService }                                      from '../../services/info-atms.service';
import { DatosJournalService }                                  from '../../services/datos-journal.service';

import { FiltrosConsultasComponent }                            from '../../shared/filtros-consultas/filtros-consultas.component';

var arrDatosAtms:any[] = [];

export const nomComponente:string = "OpersFinancierasComponent";

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
    selector: 'opers-financieras',
    templateUrl: './opers-financieras.component.html',
    styleUrls: ['./opers-financieras.component.css'],
    providers: [SoapService, InfoAtmsService, DatosJournalService]
})
export class OpersFinancierasComponent implements OnInit, OnDestroy {

    // Filtros
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "G";
    public dSolicitaFechasIni           = false;
    public dSolicitaFechasFin           = false;
    public dUltimaActualizacion:string;

    public itemResource                 = new DataTableResource([]);
    public items                        = [];
    public itemCount                    = 0;

    public regsLimite:number            = 15;
    public intervalId                   = null;
    public tiempoRefreshDatos:number    = (1000 * 60 * 1); // Actualiza la información cada minuto.
    public xtIsOnline:string            = "";
    public Titulo:string                = "";
    public opersFinancieras:any[]       = [];

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public infoAtmsService: InfoAtmsService,
                public datosJournalService: DatosJournalService) {

        console.log(nomComponente+".constructor:: Inicia");
    }

    public atmsActivos:any [] = [];

    public ngOnInit() {
        //this.datosDeOperacion();
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        this.datosDeOperacion();
        this.intervalId = setInterval(() => { this.datosDeOperacion(); }, this.tiempoRefreshDatos);
    }

    public ngOnDestroy() {
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }
    }

    public infoIdAtms:any = [];
    public obtenOpersAtms(ipAtm){

    }

    public datosDeOperacion(){

        let datosAtm:any;
        let idAtms:any[]        = this.infoAtmsService.obtenIdAtmsOnLine();
        this.opersFinancieras   = [];
        console.log("-->"+JSON.stringify(idAtms)+"<--");
        if(idAtms != null){
            idAtms.forEach( (reg) => {
                datosAtm = this.datosJournalService.obtenComisionesPorAtm({'Description': reg.Description,'descAtm': reg.Name, 'Ip': reg.Ip});
                if (datosAtm.numConsultas > 0 || datosAtm.numRetiros > 0 || datosAtm.numDepositos > 0) {
                    this.opersFinancieras.push(datosAtm);
                }
            });
        }

        this.itemResource = new DataTableResource(this.opersFinancieras);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    public parametrosConsulta(filtrosConsulta){
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        this.datosDeOperacion();
        this.intervalId = setInterval(() => { this.datosDeOperacion(); }, this.tiempoRefreshDatos);
    }

    /*
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
    */

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

}
