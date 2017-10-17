// Importamos los componentes necesarios
import { Pipe, PipeTransform } from '@angular/core';

// Le ponemos un nombre a la tuberia
@Pipe({name: 'multiplicador'})

// Definimos la clase implementado la interface PipeTransform
export class JustificaTexto implements PipeTransform {

  // La pipe recibirá el 2 parámetros
  transform(value: string): number {

    // Multiplicará los dos valores y los devolverá
    let exp = 0;
    return 0;

  }
}