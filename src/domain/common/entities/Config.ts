import _ from "lodash";
import { Id, NamedRef } from "./Base";
import { getPath } from "./OrgUnit";
import { User } from "./User";

export interface Config {
    dataSets: Record<Id, NamedRef>;
    sections: Record<Id, NamedRef>;
    currentUser: User;
    dataCommentsSqlView: NamedRef;
    dataApprovalSqlView: NamedRef;
    pairedDataElementsByDataSet: {
        [dataSetId: string]: Array<{ dataValueVal: Id; dataValueComment: Id }>;
    };
    sectionsByDataSet: {
        [dataSetId: string]: NamedRef[];
    };
    years: string[];
    completionStatus: string[];
    approvalWorkflow: NamedRef[];
}

export function getMainUserPaths(config: Config) {
    return _.compact([getPath(config.currentUser.orgUnits)]);
}
