import { Id, NamedRef, Ref } from "./Base";
import { User } from "./User";

export interface Config {
    dataSets: Record<Id, NamedRef>;
    currentUser: User;
    getDataValuesSqlView: Ref;
    pairedDataElementsByDataSet: {
        [dataSetId: string]: { dataValueVal: Id; dataValueComment: Id };
    };
}
