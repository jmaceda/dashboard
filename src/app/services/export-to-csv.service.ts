import { Injectable }     from '@angular/core';

@Injectable()
export class ExportToCSVService {

    public delimitador:string = ",";

    constructor() {
    }

    exportAllToCSV(JSONListItemsToPublish:any[], fileName:string) {
        return this.exportColumnsToCSV(JSONListItemsToPublish, fileName, null);
    }

    exportColumnsToCSV(JSONListItemsToPublish:any[], fileName:string, columns:string[]) {
        //let self = this;
console.log("--------- JMC -------");
        const items = JSONListItemsToPublish;

        // Guarda los datos en el arreglo "arrayToPublish".
        let arrayToPublish = [];

        // Por cada elemento en la lista "items"
        for (let idx = 0; idx < items.length; idx++) {

            let keys = Object.keys(items[idx]);
            let csvRow = [];

            for ( let keyId = 0; keyId < keys.length; keyId++) {

                if (!columns) {
                    csvRow[keys[keyId]] = items[idx][keys[keyId]];
                } else if (columns.indexOf(keys[keyId]) > -1) {
                    csvRow[keys[keyId]] = items[idx][keys[keyId]];
                }

            }

            arrayToPublish.push(csvRow);
        }

        const replace = (key:string, value:string) => value === null ? '' : value;
        const header = Object.keys(arrayToPublish[0]);

        let csv = arrayToPublish.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replace)).join(this.delimitador));
        csv.unshift(header.join(this.delimitador));
        let data = csv.join('\r\n');
        ExportToCSVService.download(fileName, data);
    }

    static downloadFile(filename : string, data : string, format : string) {
        let link:any;
        let csv:string = data;

        if (csv == null) return;

        data = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }

    static download(filename: string, data: any) {
        ExportToCSVService.downloadFile(filename, data, 'text/csv');
    }
}