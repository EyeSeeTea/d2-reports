import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalItemIdentifier, MalDataSet } from "../entities/MalDataApprovalItem";
import { UserGroupRepository } from "../repositories/UserGroupRepository";
import { MonitoringValueRepository } from "../repositories/MonitoringValueRepository";
import { Monitoring, MonitoringValue } from "../entities/MonitoringValue";
import _ from "lodash";

type UpdateMonitoringUseCaseOptions = {
    namespace: string;
    monitoringValue: MonitoringValue;
    dataApprovalItems: MalDataApprovalItemIdentifier[];
    dataSetName: MalDataSet;
    enableMonitoring: boolean;
};

export class UpdateMonitoringUseCase implements UseCase {
    constructor(
        private monitoringValueRepository: MonitoringValueRepository,
        private userGroupRepository: UserGroupRepository
    ) {}

    async execute(options: UpdateMonitoringUseCaseOptions): Promise<void> {
        const { namespace, monitoringValue, dataApprovalItems, dataSetName, enableMonitoring } = options;

        const dataNotificationsUserGroup = await this.userGroupRepository.getUserGroupByCode(
            malDataNotificationsUserGroup
        );
        const updatedMonitoringValue = buildMonitoringValue(
            monitoringValue,
            dataApprovalItems,
            dataSetName,
            dataNotificationsUserGroup,
            enableMonitoring
        );

        return this.monitoringValueRepository.save(namespace, updatedMonitoringValue);
    }
}

function buildMonitoringValue(
    monitoringValue: MonitoringValue,
    dataApprovalItems: MalDataApprovalItemIdentifier[],
    dataSetName: MalDataSet,
    dataNotificationsUserGroup: string,
    enableMonitoring: boolean
): MonitoringValue {
    const initialDatasetMonitoring = _.first(monitoringValue.dataSets[dataSetName]);

    if (!initialDatasetMonitoring) {
        return {
            ...monitoringValue,
            dataSets: {
                ...monitoringValue.dataSets,
                [dataSetName]: [
                    {
                        monitoring: dataApprovalItems.map(dataApprovalItem => ({
                            orgUnit: dataApprovalItem.orgUnitCode,
                            period: dataApprovalItem.period,
                            enable: enableMonitoring,
                        })),
                        userGroups: [dataNotificationsUserGroup],
                    },
                ],
            },
        };
    } else {
        const initialMonitoring = initialDatasetMonitoring.monitoring;
        const addedMonitoring = dataApprovalItems.map(dataApprovalItem => ({
            enable: enableMonitoring,
            period: dataApprovalItem.period,
            orgUnit: dataApprovalItem.orgUnitCode,
        }));

        const mergedMonitoringData = [...initialMonitoring, ...addedMonitoring].reduce<Record<string, Monitoring>>(
            (acc, entry) => ({
                ...acc,
                [`${entry.orgUnit}-${entry.period}`]: { ...acc[`${entry.orgUnit}-${entry.period}`], ...entry },
            }),
            {}
        );

        return {
            ...monitoringValue,
            dataSets: {
                ...monitoringValue.dataSets,
                [dataSetName]: [
                    {
                        monitoring: Object.values(mergedMonitoringData),
                        userGroups: [dataNotificationsUserGroup],
                    },
                ],
            },
        };
    }
}

const malDataNotificationsUserGroup = "MAL_Data_Notifications";
