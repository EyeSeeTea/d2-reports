import { Config } from "../../domain/entities/Config";
import { DataSet, getDataSetId } from "../../domain/entities/DataSet";

export interface DataSetViewModel {
    id: string;
    dataSet: string;
    orgUnit: string;
    period: string;
    completed: string;
}

export function getDataSetViews(config: Config, dataSets: DataSet[]): DataSetViewModel[] {
    return dataSets.map(dataSet => {
        return {
            id: getDataSetId(dataSet),
            dataSet: dataSet.dataSet.name,
            orgUnit: dataSet.orgUnit.name,
            period: dataSet.period,
            completed: dataSet.completed ? "Yes" : "No",
        };
    });
}
