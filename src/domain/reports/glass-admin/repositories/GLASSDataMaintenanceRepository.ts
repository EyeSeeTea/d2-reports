import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    GLASSDataMaintenanceItem,
    GLASSMaintenancePaginatedObjects,
    GLASSModule,
    Module,
} from "../entities/GLASSDataMaintenanceItem";

export interface GLASSDataMaintenanceOptions {
    paging: Paging;
    sorting: Sorting<GLASSDataMaintenanceItem>;
    module: Module | undefined;
}

export interface GLASSDataMaintenanceRepository {
    get(
        options: GLASSDataMaintenanceOptions,
        namespace: string
    ): Promise<GLASSMaintenancePaginatedObjects<GLASSDataMaintenanceItem>>;
    getUserModules(config: Config): Promise<GLASSModule[]>;
    delete(namespace: string, items: Id[]): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}
