import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    AMCRecalculation,
    ATCItem,
    ATCItemIdentifier,
    ATCPaginatedObjects,
    GLASSDataMaintenanceItem,
    GLASSMaintenancePaginatedObjects,
    GLASSModule,
} from "../entities/GLASSDataMaintenanceItem";
import { GlassAtcVersionData } from "../entities/GlassAtcVersionData";

export interface GLASSDataMaintenanceOptions {
    paging: Paging;
    sorting: Sorting<GLASSDataMaintenanceItem>;
    module: Id | undefined;
}

export interface ATCOptions {
    paging: Paging;
    sorting: Sorting<ATCItem>;
}

export interface GLASSDataMaintenanceRepository {
    get(options: GLASSDataMaintenanceOptions): Promise<GLASSMaintenancePaginatedObjects<GLASSDataMaintenanceItem>>;
    getATCs(options: ATCOptions, namespace: string): Promise<ATCPaginatedObjects<ATCItem>>;
    getLoggerProgramName(programId: string): Promise<string>;
    getRecalculationLogic(namespace: string): Promise<AMCRecalculation | undefined>;
    cancelRecalculation(namespace: string): Promise<void>;
    getUserModules(config: Config): Promise<GLASSModule[]>;
    delete(itemIds: Id[]): Promise<void>;
    uploadATC(
        namespace: string,
        glassAtcVersionData: GlassAtcVersionData,
        year: string,
        selectedItems?: ATCItemIdentifier[]
    ): Promise<void>;
    saveRecalculationLogic(namespace: string): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}
