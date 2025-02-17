import _ from "lodash";
import { MalDataApprovalItem, MalDataSet } from "./MalDataApprovalItem";

type Monitoring = {
    orgUnit: string;
    period: string;
    enable: boolean;
};

export type MonitoringValue = Record<
    "dataSets",
    Record<MalDataSet, { monitoring: Monitoring[]; userGroups: string[] }[]>
>;

export function getDataDuplicationItemMonitoringValue(
    dataSet: MalDataApprovalItem,
    dataSetName: MalDataSet,
    monitoring: MonitoringValue
): boolean {
    const monitoringArray = _.first(monitoring["dataSets"]?.[dataSetName])?.monitoring;

    return !!_.find(monitoringArray, { orgUnit: dataSet.orgUnitCode, period: dataSet.period })?.enable;
}
