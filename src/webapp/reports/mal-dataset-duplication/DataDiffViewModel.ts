import { Config } from "../../../domain/common/entities/Config";
import { DataDiffItem, getDatiffItemId } from "../../../domain/mal-dataset-duplication/entities/DataDiffItem";

export interface DataDiffViewModel {
    id: string;
    dataSetUid: string;
    orgUnitUid: string;
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
            dataSetUid: item.datasetuid,
            orgUnitUid: item.orgunituid,
            period: item.period,
            value: item.value,
            apvdvalue: item.apvdvalue,
            dataelement: item.dataelement,
            apvddataelement: item.apvddataelement,
        };
    });
}
