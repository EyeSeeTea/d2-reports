import { PaginatedObjects } from "../../../../types/d2-api";
import { Id, NamedRef } from "../../../common/entities/Base";

export type Status = "UPLOADED" | "VALIDATED" | "COMPLETED" | "DELETED";

export type Module = "AMR" | "EGASP" | "AMRIndividual" | "EAR";

export interface GLASSDataMaintenanceItem {
    id: Id;
    fileId: Id;
    fileName: string;
    module: Module;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
}

export interface GLASSModule extends NamedRef {
    name: Module;
    userGroups: {
        approveAccess?: NamedRef[];
    };
}

export interface GLASSMaintenancePaginatedObjects<T> extends PaginatedObjects<T> {
    rowIds: string[];
}
