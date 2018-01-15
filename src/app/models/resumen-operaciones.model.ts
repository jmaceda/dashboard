// Path: app/home/models
// Arrchivo: resumen-retiros.models.ts

export class ResumenOperacionesModel {

    public numeroOperaciones: number;
    public montoOperaciones: number;
    public hraPrimeaOperacion: string;
    public hraUltimaOperacion: string;

    constructor(){
        this.numeroOperaciones = 0;
        this.montoOperaciones = 0;
        this.hraPrimeaOperacion = "";
        this.hraUltimaOperacion = "";
    }

    public incrementaOper(incremento:number = 1):number {
        numeroOperaciones += incremento;
    }

    public incrementaMonto(incremento:number = 0):number {
        montoOperaciones += incremento;
    }
}