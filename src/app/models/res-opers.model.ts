/**
 * Created by jmacruz on 09/12/2017.
 */

export class IResOpersModel {
    Id: number;
    Descripcion: string;
    NumOpers: number;
    FchPrimerMto: string;
    FchUltimoMto: string;
}

export class ResOpersModel implements IResOpersModel {
    Id: number = 0;
    Descripcion: string = "";
    NumOpers: number = 0;
    Monto: number = 0;
    FchPrimerMto: string = "";
    FchUltimoMto: string = "";
}
