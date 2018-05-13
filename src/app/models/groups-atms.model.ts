/**
 * Created by jmacruz on 09/05/2018.
 */

export class IGroupsAtmsModel {
    IdAtm: number;
    IdGpo: number;
    DescGpo: string;
}

export class GroupsAtmsModel implements IGroupsAtmsModel {
    IdAtm: number = 0;
    IdGpo: number = 0;
    DescGpo: string = "";
}
