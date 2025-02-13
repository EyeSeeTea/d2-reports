import { useCallback, useEffect, useState } from "react";
import {
    MalDataApprovalItemIdentifier,
    MonitoringValue,
} from "../../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { useAppContext } from "../../../../contexts/app-context";
import _ from "lodash";

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

            if (!monitoringValue || !dataSetName) return;

            const monitoring = await compositionRoot.malDataApproval.getMonitoringValue(
                monitoringValue,
                items,
                dataSetName,
                enableMonitoring
            );

            return await compositionRoot.malDataApproval.saveMonitoring(Namespaces.MONITORING, monitoring);
        },
        [compositionRoot.malDataApproval, config.dataSets, monitoringValue]
    );

    return {
        monitoringValue: monitoringValue,
        saveMonitoring: saveMonitoring,
    };
}
