// app/atms/detalle-atms.component.ts
import { Component, OnInit, OnDestroy }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { FiltrosUtilsService }                                  from '../../services/filtros-utils.service';
import { InfoAtmsService }                                      from '../../services/info-atms.service';
import { DatosJournalService }                                  from '../../services/datos-journal.service';

import { FiltrosConsultasComponent }                            from '../../shared/filtros-consultas/filtros-consultas.component';
import { UtilsService }                                 from '../../services/utils.service';


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
    providers: [SoapService, InfoAtmsService, DatosJournalService, UtilsService]
})
export class OpersFinancierasComponent implements OnInit, OnDestroy {

    // Filtros
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "G";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = false;
    public dUltimaActualizacion:string;

    public itemResource                 = new DataTableResource([]);
    public items                        = [];
    public itemCount                    = 0;

    public regsLimite:number            = 13;
    public intervalId                   = null;
    public tiempoRefreshDatos:number    = (1000 * 60 * 1); // Actualiza la información cada minuto.
    public xtIsOnline:string            = "";
    public Titulo:string                = "";
    public opersFinancieras:any[]       = [];
    private isDatosJournal:boolean      = false;

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public infoAtmsService: InfoAtmsService,
                public datosJournalService: DatosJournalService,
                public utilsService: UtilsService) {

        console.log(nomComponente+".constructor:: Inicia");
    }

    public atmsActivos:any [] = [];

    public ngOnInit() {
        //this.datosDeOperacion();
        /*
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }



        this.datosDeOperacion();
        this.intervalId = setInterval(() => { this.datosDeOperacion(); }, this.tiempoRefreshDatos);
        */
    }

    public ngOnDestroy() {
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

    }

    public infoIdAtms:any = [];
    public obtenOpersAtms(ipAtm){

    }

    public parametrosConsulta(filtrosConsulta) {

        console.log("OpersFinancierasComponent.parametrosConsulta:: Inicio");
        let idGpo = filtrosConsulta.gpo;
        let fIniParam               = filtrosConsulta.fchInicio;
        let fFinParam               = filtrosConsulta.fchInicio;
        let ipAtm                   = filtrosConsulta.gpo;
        let timeStampStart:string   = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let timeStampEnd:string     = sprintf("%04d-%02d-%02d-23-59", fIniParam.year, fIniParam.month, fIniParam.day);
        let paramsConsulta:any      = {timeStampStart: timeStampStart, timeStampEnd: timeStampEnd, idGpo: idGpo};

        this.pDatosDelJournal(paramsConsulta);

    }

    public pDatosDelJournal(paramsConsulta){

        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        let ftoFchSys:any           = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any           = /(\d+)\/(\d+)\/(\d+)/
        let fchSys:any              = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3$1$2');
        let fchParam:any  = (paramsConsulta.timeStampEnd.substring(0,10)).replace(/-/g,"");

        this.datosDeOperacion(paramsConsulta);

        if( fchSys == fchParam) {
            this.intervalId = setInterval(() => {
                this.datosDeOperacion(paramsConsulta);
            }, this.tiempoRefreshDatos);
        }
    }

    public datosDeOperacion(paramsConsulta){

        if ($('#btnExpExel2').length == 0) {
            $('div.button-panel[_ngcontent-c6]').append('<input id="btnExpExel2" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaComisiones2Excel()">');
            //$('div.button-panel[_ngcontent-c6]').append('<input type="button" id="boton" value="Añadir texto al comienzo del párrafo">');
        }

        $('#btnExpExel2').css('cursor', 'not-allowed');
        this.isDatosJournal = true;

        let datosAtm:any;
        let idAtms:any[]        = this.infoAtmsService.obtenIdAtmsOnLine();
        this.opersFinancieras   = [];

        //$("#idDivAreaGrid span[_ngcontent-c7].glyphicon.glyphicon-triangle-right:before").css("color", "blue!important");

        //console.log("-->"+JSON.stringify(idAtms)+"<--");
        if(idAtms != null){
            idAtms.forEach( (reg) => {
                datosAtm = this.datosJournalService.obtenComisionesPorAtm(paramsConsulta, {'Description': reg.Description,'descAtm': reg.Name, 'Ip': reg.Ip});
                if (datosAtm.numConsultas > 0 || datosAtm.numRetiros > 0 || datosAtm.numDepositos > 0) {
                    this.opersFinancieras.push(datosAtm);
                }
            });

        }

        this.opersFinancieras.sort(this.utilsService.sort_by('Description', false));

        if (this.opersFinancieras.length > 0 ) {
            this.itemResource = new DataTableResource(this.opersFinancieras);
            this.itemResource.count().then(count => this.itemCount = count);
            this.reloadItems({limit: this.regsLimite, offset: 0});

            this.filtrosUtilsService.fchaHraUltimaActualizacion();
        }

        if (this.opersFinancieras.length > 0) {
            $('#btnExpExel2').css('cursor', 'pointer');
            this.isDatosJournal = true;
            //this.exportaComisiones2Excel(true);
        }else{
            $('#btnExpExel2').css('cursor', 'not-allowed');
            this.isDatosJournal = true;
        }

        this.opersFinancieras = [];
    }

    public parametrosConsultaTmp(filtrosConsulta){
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }
/*
        this.datosDeOperacion();
        this.intervalId = setInterval(() => { this.datosDeOperacion(); }, this.tiempoRefreshDatos);
        */
    }

    reloadItems(params) {
        //console.log("reloadItems::");
        this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }

    private exportaComisiones2Excel(event){
        console.log(nomComponente+".exportaComisiones2Excel:: Inicio");
        //console.log(JSON.stringify(this.opersFinancieras));
        //this.datosJournalService.exportaComisiones2Excel(this.opersFinancieras);
    }

}
