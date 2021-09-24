import { Id } from "../../domain/entities/Base";
import { MetadataObject } from "../../domain/entities/MetadataObject";

export interface MetadataObjectViewModel {
    id: Id;
    name: string;
    metadataType: string;
    publicAccess: string;
    createdBy: string;
    lastUpdatedBy: string;
    userGroupAccess: string;
    userAccess: string;
    created: string;
    lastUpdated: string;
}

export function getMetadataViews(metadataObjects: MetadataObject[]): MetadataObjectViewModel[] {
    return metadataObjects.map(object => {
        return {
            id: object.Id,
            name: object.name,
            metadataType: object.metadataType,
            publicAccess: object.publicAccess,
            createdBy: object.createdBy ?? "-",
            lastUpdatedBy: object.lastUpdatedBy ?? "-",
            userGroupAccess: object.userGroupAccess ?? "-",
            userAccess: object.userAccess ?? "-",
            created: object.created ?? "-",
            lastUpdated: object.lastUpdated ?? "-",
        };
    });
}
