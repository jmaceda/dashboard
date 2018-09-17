/* app/reportes/params/params.component.ts */
import { Component }                        from '@angular/core';
import { OnInit }                           from '@angular/core';
import { Input}                             from '@angular/core';
import { Output}                            from '@angular/core';
import { EventEmitter}                      from '@angular/core';
import { ViewChild, ViewChildren}           from '@angular/core';
import { sprintf }                          from "sprintf-js";
import { SoapService }                      from '../../services/soap.service';

import { InfoAtmsService }                  from '../../services/info-atms.service';
import { InfoGroupsService }                from '../../services/info-groups.service';
//import { BsModalComponent }                 from 'ng2-bs3-modal';
import * as $ from 'jquery';
import { NotificationsComponent } from '../../notifications/notifications.component';

export var datosATMs  = [];
export var ipATMs  = [];

var nomModulo = "FiltrosConsultasComponent";


@Component({
    selector   : 'filtros-consultas',
    templateUrl: './filtros-consultas.component.html',
    styleUrls  : ['./filtros-consultas.component.css'],
    providers: [SoapService, InfoAtmsService, InfoGroupsService],
})
export class FiltrosConsultasComponent implements OnInit {

    @Input() dUltimaActualizacion: string;      // Recibe lf fecha y hora de la ultima actualización para mostrarla en "idFchHraUltimaActual"
    @Input() dListaAtmGpos: any;                // Recibe la lista de ATMs o Grupos para ser mostrados en el combo "idComboAtmGpo".
    @Input() dTipoListaParams: any;             // Recibe si el combo "idComboAtmGpo" debe mostar A=lista de ATMs o G=lista de Grupos
    @Input() dSolicitaFechasIni: any;           // Indica si mostrara el combo para solicitar la fecha inicial o no (true=Si /false=No)
    @Input() dSolicitaFechasFin: any;           // Indica si mostrara el combo para solicitar la fecha final o no (true=Si /false=No)
    @Output() parametrosConsulta = new EventEmitter(); // Función del Componente Padre que será ejecutada al oprimir el bototon "Actualiza".


    //@ViewChild('myModal')
    //modal: BsModalComponent;
    settings = {
        bigBanner: true,
        timePicker: true,
        format: 'dd-MMM-yyyy HH:mm',
        defaultOpen: false,
        closeOnSelect: true
    };

    public contenidoCombo;
    public fchInicio: Date;
    public fchFin: Date;
    //public elijaOpcion:string = "Seleccione el ATM";
    public gListaGpos:any[];
    public ipATMs:any[] = [];
    public ip;
    public url;
    public paramsConsulta:any = {};
    public contenidoLista:string = "";
    //public gpoSeleccionado:string = "";
    public atmSeleccionado:string = "";

    public notificationsComponent: NotificationsComponent;
    //public ngbdModalBasic: NgbdModalBasic = new NgbdModalBasic();

    constructor(
                    public _soapService: SoapService,
                    public detalleAtmsService: InfoAtmsService,
                    private infoGroupsService: InfoGroupsService,
               // private modalService: NgbModal
                ){

        this.notificationsComponent = new NotificationsComponent();
    }


    public ngOnInit() {

        this.inicilizaFechasFiltro();

        if (this.dTipoListaParams == "G") {
            this.contenidoCombo     = "Grupos";
            this.ipATMs             = this.infoGroupsService.obtenDescGroupsConAtms();
            this.contenidoLista     = "Seleccione Grupo";
        } else if (this.ipATMs.length == 0) {
            this.contenidoCombo     = "ATMs";
            this.ipATMs             = this.detalleAtmsService.obtenGetAtm();
            this.contenidoLista     = "Seleccione ATM";
        }

        this.ipATMs.sort(function (a, b) {
            return a.localeCompare(b);
        });

        if( this.dSolicitaFechasIni && this.dSolicitaFechasFin){
            $('#idDivFechas').css({'display': 'table-cell','vertical-align': 'middle', 'text-align': 'center'});
        }
    }

    public inicilizaFechasFiltro(){
        let fchSys      = new Date();
        let _anioSys    = fchSys.getFullYear();
        let _mesSys     = fchSys.getMonth();
        let _diaSys     = fchSys.getDate();

        this.fchInicio  = new Date( _anioSys, _mesSys, _diaSys, 0, 0, 0 );
        this.fchFin     = new Date( _anioSys, _mesSys, _diaSys, 23, 59, 59 );
    }

    public validaParams(paramsConsulta){

        let msgValidaciones:any = [];

        if (this.dTipoListaParams == "G") {
            if (paramsConsulta.gpo == -1 || paramsConsulta.gpo == "-1"){
                msgValidaciones.push("No ha indicado el Grupo a consultar");
            }
        } else {
            if (paramsConsulta.atm == "" || paramsConsulta.atm == null || paramsConsulta.atm == undefined){
                msgValidaciones.push("No ha indicado el ATM a consultar");
            }
        }

        if (this.dSolicitaFechasIni && this.dSolicitaFechasFin){
           if (paramsConsulta.fchInicio.milsec > paramsConsulta.fchFin.milsec){
               msgValidaciones.push("La fecha Inicial es mayor a la Final");
           }
        }

        if (this.dSolicitaFechasIni){
            if (paramsConsulta.fchInicio.milsec > (new Date().getTime())){
                msgValidaciones.push("La fecha Inicial es mayor a la Actual");
            }
        }

        if (msgValidaciones.length > 0){
            this.notificationsComponent.showNotification('top','center', 'warning', msgValidaciones);
            return(false);
        }
        return(true);
    }

    public pActualizaInfo(){

        let fchInicio   = this.Date2Json(this.fchInicio);
        let fchFin      = this.Date2Json(this.fchFin);
        let ipATM       = this.atmSeleccionado;

        let idGpo:any;

        $('#btnRefreshJournal').css('cursor', 'pointer');

        if (this.dTipoListaParams == "G") {
            if (this.atmSeleccionado != "Todos") {
                idGpo = this.infoGroupsService.obtenIdGroup(this.atmSeleccionado);
            }
            idGpo = (typeof(idGpo) == 'number') ? idGpo.toString() : idGpo;
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, gpo: idGpo};
        }else {
            ipATM = ipATM.substring(ipATM.lastIndexOf("(") + 1).replace(")", "");
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, atm: ipATM};
        }

        let paramsOk:any = this.validaParams(this.paramsConsulta);
        if (paramsOk == true){
            this.parametrosConsulta.emit(this.paramsConsulta);
        }
    }


    public Date2Json(fecha:Date):string {

        let fchLocal: Date = ( typeof(fecha) == 'string') ? new Date(fecha) : fecha;
        let fchJson:any = {};

        fchJson.year    = fchLocal.getFullYear();
        fchJson.month   = fchLocal.getMonth() +1;
        fchJson.day     = fchLocal.getDate();
        fchJson.hour    = fchLocal.getHours();
        fchJson.min     = fchLocal.getMinutes();
        fchJson.sec     = fchLocal.getSeconds();
        fchJson.milsec  = fchLocal.getTime();

        return(fchJson);
    }

    public pAtmSeleccionado(idx){}

    private muestraDosFecha(){
        if (this.dSolicitaFechasIni && this.dSolicitaFechasFin){
            return("A");
        }else if (this.dSolicitaFechasIni && !this.dSolicitaFechasFin){
            return("I");
        }
    }

    private pActualizaParams(){}
}

