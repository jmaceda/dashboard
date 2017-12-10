/**
 * Created by jmacruz on 09/12/2017.
 */

import { Injectable } from '@angular/core';
import { Instance } from 'JsStore';
//import JsStore  from 'jsstore';

//import * as JsStore from "jsstore";
//<reference path="../node_modules/jsstore/dist/jsstore.d.ts"/>
declare var JsStore: any;

@Injectable()
export class DataBaseService {
    _connection: Instance;

    constructor() {
        this._connection = new JsStore.Instance();
        let That = this,
            DatabaseName = 'pentomino';

        JsStore.isDbExist(DatabaseName).then(isExist => {
            if (isExist) {
                That._connection.openDb(DatabaseName);
            }
            else {
                const DataBase = That.getDatabase();
                That._connection.createDb(DataBase);
            }
        }).catch(err => {
            // this will be fired when indexedDB is not supported.
            alert(err.Message);
        });
    }

    private getDatabase = function () {
        const TblResOpers = {
            Name: 'ResOpers',
            Columns: [
                {
                    Name: 'Id',
                    PrimaryKey: true,
                    AutoIncrement: true
                },
                {
                    Name: 'Descripcion',
                    DataType: 'string',
                    Default: 0
                },
                {
                    Name: 'NumOpers',
                    DataType: 'number',
                    Default: 0
                },
                {
                    Name: 'Monto',
                    NotNull: true,
                    DataType: 'number'
                },
                {
                    Name: 'FchPrimerMto',
                    NotNull: true,
                    DataType: 'string'
                },
                {
                    Name: 'FchUltimoMto',
                    NotNull: true,
                    DataType: 'string'
                }
            ]
        };
        const DataBase = {
            Name: 'ResOpers',
            Tables: [TblResOpers]
        };

        return DataBase as any;
    }
}

