import { Injectable }     from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE      = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExportToCSVService {

    public delimitador:string = ",";

    constructor() {
    }

    exportAllToCSV(JSONListItemsToPublish:any[], fileName:string) {
        return this.exportColumnsToCSV(JSONListItemsToPublish, fileName, null);
    }

    exportColumnsToCSV(JSONListItemsToPublish:any[], fileName:string, columns:string[]) {

        const items = JSONListItemsToPublish;

        let arrayToPublish = [];

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


    public exportAsExcelFile(excelFileName: string, nomTabla: string, json?: any[]): void {
        console.log("exportAsExcelFile");

        /* Ancho de cada columna */
        var wscols = [
            {width: 4},   /* Columna A */
            {width: 10},  /* Columna B */
            {width: 10},  /* Columna C */
            {width: 5},   /* Columna D */
            {width: 12}   /* Columna E */
        ];


        /* create new workbook */
        var workbookJ1 = XLSX.utils.book_new();

        /* convert table 'table1' to worksheet named "Sheet1" */
        var ws1 = XLSX.utils.table_to_sheet(document.getElementById(nomTabla));
        //ws1.ColInfo['D'] = {'wch?': 40};
        //ws1.D3 = { w: "#0.00"};
        ws1.cellDates = true;
        XLSX.utils.book_append_sheet(workbookJ1, ws1, "InfoHoy");
        //ws1.D3  = { t:'n', z: "#0.00" };
        //ws1.D3  = { t:'n'};
        //ws1.D3  = { z: "#0.00"};
        ws1["D3"].z = "#,##0.00";
        //ws1["E3"].cellDates = false;
        //ws1["E3"].w = "m/d/yy";

        //ws1['E3'] = { t:'n', f: "SUM(A1:A3*B1:B3)", F:"C1:C1" };
        var range = XLSX.utils.decode_range(ws1['!ref']);
        var ncols = range.e.c - range.s.c + 1, nrows = range.e.r - range.s.r + 1;
        ws1['F3'] = { t:'n', f: "A3+D3", F:"F3:F5", bold: true, alignRight: true };
        ws1['F4'] = { t:'n', F:"F3:F5" };
        //
        //ws1["!ref"] = "E1S";

        /*
         ws1['!ref'] = XLSX.utils.encode_range({
         s: { c: 4, r: 0 },
         e: { c: 4, r: 30 }
         });
         */
        ws1['!cols'] = wscols;
        ws1['F3']    = { s: { alignment: {textRotation: 90 }, font: {sz: 14, bold: true, color: "#FF00FF" }} };
        var ws2      = XLSX.utils.table_to_sheet(document.getElementById('tablaDatos'));
        XLSX.utils.book_append_sheet(workbookJ1, ws2, "Resumen");

        var wboutJ1 = XLSX.write(workbookJ1, {bookType:'xlsx', type:'buffer', cellDates: true});

        /*
         var wb = XLSX.utils.table_to_book(document.getElementById('tablaDatos'));

         var wbout = XLSX.write(wb, {bookType:'xlsx', type:'buffer'});


         var tbl = document.getElementById('tablaDatos');
         //var wb = XLSX.utils.table_to_book(tbl);
         const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tbl);
         //const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, {header:["A","B","C","D","E","F","G"]});
         const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
         const excelBuffer: any        = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
         */


        for(var R = range.s.r; R <= range.e.r; ++R) {
            for(var C = range.s.c; C <= range.e.c; ++C) {
                var cell_address = {c:C, r:R};
                /* if an A1-style address is needed, encode the address */
                var cell_ref = XLSX.utils.encode_cell(cell_address);
                console.log(cell_ref);
            }
        }

        this.saveAsExcelFile(wboutJ1, excelFileName);
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }

}