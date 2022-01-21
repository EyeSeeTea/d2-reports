import { Id } from "./Base";

export interface ProgramIndicator {
    Id: Id;
    name: string;
    metadataType: string;
    publicAccess: string;
    expression: string
    filter: string;
    createdBy?: string;
    lastUpdatedBy?: string;
    userGroupAccess?: string;
    userAccess?: string;
    lastUpdated?: string;
    created?: string;
}
