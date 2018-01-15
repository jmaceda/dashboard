// Path: app/home/models
// Arrchivo: resumen-retiros.models.ts

export class ResumenOperacionesModel {

    public numOpers: number;
    public montoOpers: number;
    public hraPrimOper: string;
    public hraUltOper: string;

    constructor(){
        this.numOpers = 0;
        this.montoOpers = 0;
        this.hraPrimOper = "";
        this.hraUltOper = "";
    }

    public incrementaOper(incremento:number = 1):void {
        this.numOpers += incremento;
    }

    public incrementaMonto(incremento:number = 0):void {
        this.montoOpers += incremento;
    }
}