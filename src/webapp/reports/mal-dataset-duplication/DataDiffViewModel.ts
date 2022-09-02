import { Config } from "../../../domain/common/entities/Config";
import { DataDiffItem, getDatiffItemId } from "../../../domain/mal-dataset-duplication/entities/DataDiffItem";

export interface DataDiffViewModel {
    id: string;
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    value: string | undefined;
    apvdvalue: string | undefined;
    dataelement: string | undefined;
    apvddataelement: string | undefined;
}

export function getDataADiffViews(_config: Config, items: DataDiffItem[]): DataDiffViewModel[] {
    return items.map(item => {
        return {
            id: getDatiffItemId(item),
            dataSetUid: item.dataSetUid,
            dataSet: item.dataSet,
            orgUnitUid: item.orgUnitUid,
            orgUnit: item.orgUnit,
            period: item.period,
            value: item.value,
            apvdvalue: item.apvdvalue,
            dataelement: item.dataelement,
            apvddataelement: item.apvddataelement,
        };
    });
}
