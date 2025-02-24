import { useCallback, useEffect, useState } from "react";
import {
    MalDataApprovalItemIdentifier,
    malDataSets,
} from "../../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { useAppContext } from "../../../../contexts/app-context";
import _ from "lodash";
import { MonitoringValue } from "../../../../../domain/reports/mal-data-approval/entities/MonitoringValue";

export function useDataApprovalMonitoring() {
    const { compositionRoot, config } = useAppContext();
    const [monitoringValue, setMonitoringValue] = useState<MonitoringValue>();

    useEffect(() => {
        compositionRoot.malDataApproval.getMonitoring(Namespaces.MONITORING).then(setMonitoringValue);
    }, [compositionRoot.malDataApproval]);

    const saveMonitoring = useCallback(
        async (items: MalDataApprovalItemIdentifier[], enableMonitoring: boolean) => {
            const dataSetName = _.values(config.dataSets).find(dataSet =>
                items.map(item => item.dataSet).includes(dataSet.id)
            )?.name;
            const dataSetApprovalName = malDataSets.find(dataSet => dataSet === dataSetName);

            if (!monitoringValue) return;
            if (!dataSetApprovalName) throw new Error("Data set not found");

            return await compositionRoot.malDataApproval.updateMonitoring({
                namespace: Namespaces.MONITORING,
                monitoringValue: monitoringValue,
                dataApprovalItems: items,
                dataSetName: dataSetApprovalName,
                enableMonitoring: enableMonitoring,
            });
        },
        [compositionRoot.malDataApproval, config.dataSets, monitoringValue]
    );

    return {
        saveMonitoring: saveMonitoring,
    };
}
