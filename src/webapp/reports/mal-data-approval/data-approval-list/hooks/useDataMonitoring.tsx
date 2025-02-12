import { useCallback, useEffect, useState } from "react";
import {
    MalDataApprovalItemIdentifier,
    Monitoring,
    MonitoringValue,
} from "../../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { useAppContext } from "../../../../contexts/app-context";
import { MAL_WMR_FORM } from "../../../../../data/reports/mal-data-approval/MalDataApprovalDefaultRepository";

export function useDataMonitoring() {
    const { compositionRoot, config } = useAppContext();
    const [monitoringValue, setMonitoringValue] = useState<MonitoringValue>();

    useEffect(() => {
        compositionRoot.malDataApproval.getMonitoring(Namespaces.MONITORING).then(setMonitoringValue);
    }, [compositionRoot.malDataApproval]);

    const getMonitoringJson = useCallback(
        async (
            initialMonitoringValues: MonitoringValue,
            addedMonitoringValues: Monitoring[],
            dataSet: string
        ): Promise<MonitoringValue> => {
            return await compositionRoot.malDataApproval.getMonitoringValue(
                initialMonitoringValues,
                addedMonitoringValues,
                dataSet
            );
        },
        [compositionRoot.malDataApproval]
    );

    const saveMonitoring = useCallback(
        async (items: MalDataApprovalItemIdentifier[], enableMonitoring: boolean) => {
            if (!monitoringValue) return;

            const monitoringValues = items.map(item => {
                return {
                    orgUnit: item.orgUnit,
                    period: item.period,
                    enable: enableMonitoring,
                };
            });
            const monitoringJson = await getMonitoringJson(
                monitoringValue,
                monitoringValues,
                config.dataSets[MAL_WMR_FORM]?.name ?? "" // use actual name from config or filter
            );

            return await compositionRoot.malDataApproval.saveMonitoring(Namespaces.MONITORING, monitoringJson);
        },
        [compositionRoot.malDataApproval, config.dataSets, getMonitoringJson, monitoringValue]
    );

    return {
        monitoringValue: monitoringValue,
        saveMonitoring: saveMonitoring,
    };
}
