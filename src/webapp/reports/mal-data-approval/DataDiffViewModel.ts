import { Config } from "../../../domain/common/entities/Config";
import { DataDiffItem, getDataDiffItemId } from "../../../domain/reports/mal-data-approval/entities/DataDiffItem";

export interface DataDiffViewModel {
    id: string;
    dataSetUid: string;
    orgUnitUid: string;
    period: string;
    value: string | undefined;
    apvdValue: string | undefined;
    dataElement: string | undefined;
    apvdDataElement: string | undefined;
    comment: string | undefined;
    apvdComment: string | undefined;
    lastUpdated: string | undefined;
    lastUpdatedBy: string | undefined;
    lastSubmissionDate: string | undefined;
    lastSubmittedBy: string | undefined;
    categoryOption: string | undefined;
}

export function getDataDiffViews(_config: Config, items: DataDiffItem[]): DataDiffViewModel[] {
    return items.map(item => {
        return {
            id: getDataDiffItemId(item),
            dataSetUid: item.dataSetUid,
            orgUnitUid: item.orgUnitUid,
            period: item.period,
            value: item.value,
            apvdValue: item.apvdValue,
            dataElement: item.dataElement,
            apvdDataElement: item.apvdDataElement,
            comment: item.comment,
            apvdComment: item.apvdComment,
            lastUpdated: item.lastUpdated,
            lastUpdatedBy: item.lastUpdatedBy,
            lastSubmissionDate: item.lastSubmissionDate,
            lastSubmittedBy: item.lastSubmittedBy,
            categoryOption: item.categoryOption,
        };
    });
}
