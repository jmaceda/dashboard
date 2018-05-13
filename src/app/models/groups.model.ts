/**
 * Created by jmacruz on 09/05/2018.
 */

export class IGroupsModel {
    Id: number;
    Description: string;
    Description2: string;
}

export class GroupsModel implements IGroupsModel {
    Id: number = 0;
    Description: string = "";
    Description2: string = "";
}
