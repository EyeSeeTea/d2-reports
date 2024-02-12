import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    AMCRecalculation,
    ATCItem,
    ATCItemIdentifier,
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

export interface ATCOptions {
    paging: Paging;
    sorting: Sorting<ATCItem>;
}

export interface GLASSDataMaintenanceRepository {
    get(
        options: GLASSDataMaintenanceOptions,
        namespace: string
    ): Promise<GLASSMaintenancePaginatedObjects<GLASSDataMaintenanceItem>>;
    getATCs(options: ATCOptions, namespace: string): Promise<PaginatedObjects<ATCItem>>;
    getLoggerProgramName(programId: string): Promise<string>;
    getRecalculationLogic(namespace: string): Promise<AMCRecalculation | undefined>;
    cancelRecalculation(namespace: string): Promise<void>;
    getUserModules(config: Config): Promise<GLASSModule[]>;
    delete(namespace: string, items: Id[]): Promise<void>;
    uploadATC(namespace: string, file: File, year: string, items?: ATCItemIdentifier[]): Promise<void>;
    saveRecalculationLogic(namespace: string): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}
