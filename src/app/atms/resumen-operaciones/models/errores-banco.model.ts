// Path: app/home/models
// Arrchivo: errores-banco.model.ts

export class ErroresBanco {
    public id: number;
    public banco: string;
    public descError: string;
    public cntErrores: number;

    constructor (banco: string, descError: string, cntErrores: number){
        this.banco = banco;
        this.descError = descError;
        this.cntErrores = cntErrores;
    }
}
