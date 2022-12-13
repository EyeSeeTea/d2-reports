import { Id, NamedRef } from "./Base";
import { OrgUnit } from "./OrgUnit";

export interface User {
    id: Id;
    name: string;
    username: string;
    orgUnits?: OrgUnit[];
    userRoles?: NamedRef[];
    userGroups?: NamedRef[];
    externalAuth?: boolean;
    twoFA?: boolean;
    disabled?: boolean;
    email?: string;
}
