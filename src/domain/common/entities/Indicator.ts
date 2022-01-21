import { Id } from "./Base";

export interface Indicator {
    id: Id;
    name: string;
    shortName: string;
    metadataType: string;
    numerator: string;
    nominator_error: string;
    denominator_error: string;
    filter_error: string;
    expression: string;
    type: string;
    denominator: string;
    filter: string;
    publicAccess: string;
    createdBy: string;
    lastUpdatedBy: string;
    userGroupAccess: string;
    userAccess: string;
    created: string;
    lastUpdated: string;
}
