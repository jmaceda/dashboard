// importamos el modulo Injectable de AngularJS
import { Injectable } from '@angular/core';
import { DepositosModel }   from '../models/depositos';
import { DesglosaBilletes } from './DesglosaBilletes.service';
import { sprintf }          from "sprintf-js";
//import Dexie                from 'dexie';
//import { Logger, Level }                                 from "angular2-logger/core";

var bdRedBlu = 'RedBluDB';
var dbDexieLocal;


// Permitimos que este objeto se pueda inyectar con la DI
@Injectable()
export class RetirosXhora {

    constructor(
        //public logger: Logger,
        public _desglosaBilletes: DesglosaBilletes){}

}