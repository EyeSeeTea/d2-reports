import { Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";
import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { GLASSDataSubmissionItem, GLASSDataSubmissionItemIdentifier } from "../entities/GLASSDataSubmissionItem";

export interface GLASSDataSubmissionRepository {
    get(options: GLASSDataSubmissionOptions, namespace: string): Promise<PaginatedObjects<GLASSDataSubmissionItem>>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    dhis2MessageCount(): Promise<number>;
    approve(namespace: string, items: GLASSDataSubmissionItemIdentifier[]): Promise<void>;
    reject(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        message?: string,
        isDatasetUpdate?: boolean
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
    orgUnitIds: Id[];
    completionStatus?: boolean;
    submissionStatus?: Status;
}
