/**
 *
 */

export class IDevicesModel {
    id: string;
    description: string;
}

export class DevicesModel implements IDevicesModel {
    public id: string = "";
    public description: string = "";

    constructor(id: string, description: string){
        this.id          = id;
        this.description = description;
    }
}
