import { Id, NamedRef } from "./Base";
import { User } from "./User";

export interface Config {
    dataSets: Record<Id, NamedRef>;
    currentUser: User;
    pairedDataElements: Record<Id /* datasSetId */, [Id, Id]>;
}
