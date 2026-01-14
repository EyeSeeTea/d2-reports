import _ from "lodash";
import { PaginatedObjects } from "../../../../types/d2-api";
import { Id, NamedRef } from "../../../common/entities/Base";
import { User } from "../../../common/entities/User";

export type Status = "UPLOADED" | "IMPORTED" | "VALIDATED" | "COMPLETED" | "DELETED";

export interface GLASSDataMaintenanceItem {
    id: Id;
    orgUnit: Id;
    orgUnitName: string;
    fileType: string;
    fileId: Id;
    fileName: string;
    period: string;
    status: Status;
    module: Id;
}

type Module = "AMR" | "AMR - Individual" | "AMR - Fungal" | "AMC" | "EGASP" | "EAR";

export interface GLASSModule extends NamedRef {
    name: Module;
    userGroups: {
        approveAccess: NamedRef[];
    };
}

export interface GLASSMaintenancePaginatedObjects<T> extends PaginatedObjects<T> {
    itemIdsNotDeletedStatus: Id[];
}

export interface ATCPaginatedObjects<T> extends PaginatedObjects<T> {
    uploadedYears: string[];
}

export interface ATCItem {
    currentVersion: boolean;
    previousVersion: boolean;
    uploadedDate: string;
    version: string;
    year: string;
}

export interface ATCItemIdentifier {
    currentVersion: boolean;
    version: string;
    year: string;
}

export interface AMCRecalculation {
    date: string;
    recalculate: boolean;
    orgUnitsIds: Id[];
    periods: string[];
    loggerProgram: string;
}

export function getATCItemId(atc: ATCItem): string {
    return [atc.year, atc.version, atc.currentVersion].join("-");
}

export function parseATCItemId(string: string): ATCItemIdentifier | undefined {
    const [year, version, currentVersion] = string.split("-");

    if (!year || !version || !currentVersion) return undefined;

    return { year, version, currentVersion: currentVersion === "true" };
}

export function getUserModules(modules: GLASSModule[], user: User): GLASSModule[] {
    const userGroups = user.userGroups;
    const userGroupIds = userGroups.map(userGroup => userGroup.id);

    const userModules = modules.filter(module => {
        const moduleUserGroupIds = module.userGroups.approveAccess.map(userGroup => userGroup.id) ?? [];

        return _.some(moduleUserGroupIds, moduleUserGroupId => userGroupIds.includes(moduleUserGroupId));
    });

    return userModules;
}
