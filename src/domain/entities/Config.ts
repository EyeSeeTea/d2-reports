import _ from "lodash";
import { Id, NamedRef, Ref } from "./Base";
import { getPath } from "./OrgUnit";
import { User } from "./User";

export interface Config {
    dataSets: Record<Id, NamedRef>;
    sections: Record<Id, NamedRef>;
    currentUser: User;
    getDataValuesSqlView: Ref;
    pairedDataElementsByDataSet: {
        [dataSetId: string]: Array<{ dataValueVal: Id; dataValueComment: Id }>;
    };
    sectionsByDataSet: {
        [dataSetId: string]: NamedRef[];
    };
    years: string[];
}

export function getMainUserPaths(config: Config) {
    return _.compact([getPath(config.currentUser.orgUnits)]);
}
