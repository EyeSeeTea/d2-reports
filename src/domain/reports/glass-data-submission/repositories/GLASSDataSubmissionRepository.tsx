import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { GLASSDataSubmissionItem } from "../entities/GLASSDataSubmissionItem";

export interface GLASSDataSubmissionRepository {
    get(options: GLASSDataSubmissionOptions, namespace: string): Promise<PaginatedObjects<GLASSDataSubmissionItem>>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}

export interface GLASSDataSubmissionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<GLASSDataSubmissionItem>;
    periods: string[];
    orgUnitIds: Id[];
    completionStatus?: boolean;
}
