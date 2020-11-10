import { Id, NamedRef, Ref } from "./Base";
import { User } from "./User";

export interface Config {
    dataSets: Record<Id, NamedRef>;
    sections: Record<Id, NamedRef>;
    sectionOrderAttribute: Ref;
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
