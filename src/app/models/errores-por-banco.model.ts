export class ErroresPorBanco{
    public nomBanco:string;
    public descError:string;
    public numErrores:number;

    constructor(nomBanco:string, descErroro:string, numErrores:number){
        this.nomBanco = nomBanco;
        this.descError = descErroro;
        this.numErrores = numErrores;
    };
}