/**
 * Created by jmacruz on 13/01/2018.
 */

export class AcumulaBilletesModel {
    constructor(
        public b20: number,
        public b50: number,
        public b100: number,
        public b200: number,
        public b500: number,
        public b1000: number,
        public opers: number,
        public monto: number
    ){}
}