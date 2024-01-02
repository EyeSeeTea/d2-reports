import _ from "lodash";
import { PaginatedObjects } from "../../../../types/d2-api";
import { Id, NamedRef } from "../../../common/entities/Base";
import { User } from "../../../common/entities/User";

export type Status = "UPLOADED" | "VALIDATED" | "COMPLETED" | "DELETED";

export type Module = "AMR" | "EGASP" | "AMRIndividual" | "EAR";

export interface GLASSDataMaintenanceItem {
    id: Id;
    fileId: Id;
    fileName: string;
    fileType: string;
    module: Module;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
}

export interface GLASSModule extends NamedRef {
    name: Module;
    userGroups: {
        approveAccess: NamedRef[];
    };
}

export interface GLASSMaintenancePaginatedObjects<T> extends PaginatedObjects<T> {
    rowIds: string[];
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
