import { Id, Named } from "./Base";

export interface DataSet {
    dataSet: Named;
    orgUnit: Named;
    period: string;
    completed: string;
}

export function getDataSetId(dataSet: DataSet): Id {
    return [dataSet.dataSet, dataSet.period, dataSet.orgUnit].join("-");
}
