// importamos el modulo Injectable de AngularJS
import { Injectable } from '@angular/core';

// Permitimos que este objeto se pueda inyectar con la DI
@Injectable()
export class PeliculasService {

    extraeBilletes(data:string): string {
        // extrae la sección de billetes
        var billOperacion = data.replace(/PROCESADEPOSITO ConfirmaDeposito |[\[\]]/g,"");
        //console.log("billOperacion: ["+billOperacion+"]");

        var desglose = {'b20': 0, 'b50': 0, 'b100': 0, 'b200': 0, 'b500': 0, 'b1000': 0, 'monto': 0};
        var monto    = 0;

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
            monto += parseInt(billDenomina[0]) * parseInt(billDenomina[1]);
            
            //console.log("Billetes: ["+a+"]");
        }
        desglose.monto = monto;
        //console.log("["+ JSON.stringify(desglose) +"]")

        return(JSON.stringify(desglose));
    }

    // Definimos un método que recibe un parámetro y devuelve un string
    getPelicula(data: string) {
        //let pelicula = "Batman v Superman - Puntuación: "+puntuacion;
        console.log("getPelicula:: "+data);
        let desgloseBilletes = this.extraeBilletes(data);
        return desgloseBilletes;
    }

}
