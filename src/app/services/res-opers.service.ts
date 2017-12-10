/**
 * Created by jmacruz on 09/12/2017.
 */

import { Injectable } from '@angular/core';
import { DataBaseService } from './data-base.service';

@Injectable()
export class ResOpersService {

    _connection;

    constructor(database: DataBaseService) {
        this._connection = database._connection;
    }

    selectResOper = function (nomTab) {
        // jsstore returns promise, when you dont specify OnSuccess
        return this._connection.select({
            From: nomTab
        });
    };

    insertResOper = function (valReg, nomTab) {
        return this._connection.insert({
            Into: nomTab,
            Values: [valReg]
        });
    };

}

