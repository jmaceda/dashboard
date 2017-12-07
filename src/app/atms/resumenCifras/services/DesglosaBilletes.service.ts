// importamos el modulo Injectable de AngularJS
import { Injectable } from '@angular/core';

// Permitimos que este objeto se pueda inyectar con la DI
@Injectable()
export class DesglosaBilletes {

    extraeBilletes(data:string): string {
        var billOperacion = data.replace(/PROCESADEPOSITO ConfirmaDeposito |[\[\]]/g,"");
        var desglose      = {'b20': 0, 'b50': 0, 'b100': 0, 'b200': 0, 'b500': 0, 'b1000': 0, 'monto': 0};
        var monto:number  = 0;

        for(var billetes of billOperacion.split('|')){
            var billDenomina = billetes.split('x');
            
            switch(billDenomina[1]){
                case '20':   desglose.b20   = parseInt(billDenomina[0]); break;
                case '50':   desglose.b50   = parseInt(billDenomina[0]); break;
                case '100':  desglose.b100  = parseInt(billDenomina[0]); break;
                case '200':  desglose.b200  = parseInt(billDenomina[0]); break;
                case '500':  desglose.b500  = parseInt(billDenomina[0]); break;
                case '1000': desglose.b1000 = parseInt(billDenomina[0]); break;
            }
            if (parseInt(billDenomina[0]) > 0){
                monto += parseInt(billDenomina[0]) * parseInt(billDenomina[1]);
            }

        }

        desglose.monto = (monto == null) ? 0: monto;

        return(JSON.stringify(desglose));
    }

    getDesglose(data: string) {
        let desgloseBilletes = this.extraeBilletes(data);
        return desgloseBilletes;
    }

}
