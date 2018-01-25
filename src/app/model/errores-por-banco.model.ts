//  app/models/errores-por-banco.model.ts
export class ErroresPorBanco{
    public nomBanco:string;
    public descError:string;
    public codError:number;
    public numErrores:number;
    public tipoOper:string;

    constructor(nomBanco:string, descErroro:string, codError:number, numErrores:number, tipoOper:string){
        this.nomBanco = nomBanco;
        this.descError = descErroro;
        this.codError = codError;
        this.numErrores = numErrores;
        this.tipoOper = tipoOper;
    };


    public incErrBanco(nomBanco:string, descError:string, codError:number, tipoOper:string){
        console.log("ErroresPorBanco.ErroresPorBanco:: nomBanco["+nomBanco+"]  descError["+descError+"]  codError["+codError+"]  tipoOper["+tipoOper+"]");
    }
}