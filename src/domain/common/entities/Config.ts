import _ from "lodash";
import { Id, NamedRef } from "./Base";
import { getPath } from "./OrgUnit";
import { User } from "./User";

export interface Config {
    dataSets: Record<Id, NamedRef>;
    sections: Record<Id, NamedRef>;
    currentUser: User;
    sqlViews: Record<string, NamedRef>;
    pairedDataElementsByDataSet: {
        [dataSetId: string]: Array<{ dataValueVal: Id; dataValueComment: Id }>;
    };
    sectionsByDataSet: {
        [dataSetId: string]: NamedRef[];
    };
    years: string[];
    approvalWorkflow: NamedRef[];
}

export function getMainUserPaths(config: Config) {
    return _.compact([getPath(config.currentUser.orgUnits)]);
}

export function getSqlViewId(config: Config, name: string): string {
    const sqlViewId = config.sqlViews[name]?.id;

    if (!sqlViewId) {
        throw new Error(`Missing SQL view: ${name}`);
    }

    return sqlViewId;
}
