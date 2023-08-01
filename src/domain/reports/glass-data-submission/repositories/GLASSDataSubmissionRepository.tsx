import { Module, Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";
import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    EARDataSubmissionItem,
    EARSubmissionItemIdentifier,
    GLASSDataSubmissionItem,
    GLASSDataSubmissionItemIdentifier,
    GLASSUserPermission,
} from "../entities/GLASSDataSubmissionItem";

export interface GLASSDataSubmissionRepository {
    get(options: GLASSDataSubmissionOptions, namespace: string): Promise<PaginatedObjects<GLASSDataSubmissionItem>>;
    getEAR(options: EARDataSubmissionOptions, namespace: string): Promise<PaginatedObjects<EARDataSubmissionItem>>;
    getUserGroupPermissions(): Promise<GLASSUserPermission>;
    getColumns(namespace: string): Promise<string[]>;
    getEARColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    saveEARColumns(namespace: string, columns: string[]): Promise<void>;
    dhis2MessageCount(): Promise<number>;
    approve(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        signals?: EARSubmissionItemIdentifier[]
    ): Promise<void>;
    reject(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        message?: string,
        isDatasetUpdate?: boolean,
        signals?: EARSubmissionItemIdentifier[]
    ): Promise<void>;
    reopen(namespace: string, items: GLASSDataSubmissionItemIdentifier[]): Promise<void>;
    accept(namespace: string, items: GLASSDataSubmissionItemIdentifier[]): Promise<void>;
    getGLASSDashboardId(namespace: string, items: GLASSDataSubmissionItemIdentifier[]): Promise<string>;
}

export interface GLASSDataSubmissionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<GLASSDataSubmissionItem>;
    periods: string[];
    quarters: string[];
    module: Module;
    orgUnitIds: Id[];
    completionStatus?: boolean;
    submissionStatus?: Status;
}

export interface EARDataSubmissionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<EARDataSubmissionItem>;
    module: Module;
    orgUnitIds: Id[];
    from: Date | null;
    to: Date | null;
    submissionStatus?: Status;
}
