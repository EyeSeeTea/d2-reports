import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalItemIdentifier, Monitoring, MonitoringValue } from "../entities/MalDataApprovalItem";
import { UserGroupRepository } from "../repositories/UserGroupRepository";
import { CountryCodeRepository } from "../repositories/CountryCodeRepository";
import { CountryCode } from "../entities/CountryCode";

export class GetMonitoringValueUseCase implements UseCase {
    constructor(
        private countryCodeRepository: CountryCodeRepository,
        private userGroupRepository: UserGroupRepository
    ) {}

    async execute(
        monitoringValue: MonitoringValue,
        items: MalDataApprovalItemIdentifier[],
        dataSetName: string,
        enableMonitoring: boolean
    ): Promise<MonitoringValue> {
        const monitoringValues = items.map(item => {
            return {
                orgUnit: item.orgUnit,
                period: item.period,
                enable: enableMonitoring,
            };
        });
        const dataNotificationsUserGroup = await this.userGroupRepository.getUserGroupByCode(
            malDataNotificationsUserGroup
        );
        const countryCodes = await this.countryCodeRepository.getCountryCodes();

        return getMonitoringJson(
            monitoringValue,
            monitoringValues,
            dataSetName,
            countryCodes,
            dataNotificationsUserGroup
        );
    }
}

function getMonitoringJson(
    monitoringValue: MonitoringValue,
    addedMonitoringValues: Monitoring[],
    dataSetName: string,
    countryCodes: CountryCode[],
    dataNotificationsUserGroup: string
): MonitoringValue {
    const initialMonitoring = _.first(monitoringValue["dataSets"]?.[dataSetName])?.monitoring ?? [];
    const newDataSets = _.merge({}, monitoringValue["dataSets"], {
        [dataSetName]: [
            _.omit(
                {
                    monitoring: combineMonitoringValues(initialMonitoring, addedMonitoringValues).map(monitoring => {
                        return {
                            ...monitoring,
                            orgUnit:
                                monitoring.orgUnit.length > 3
                                    ? countryCodes.find(countryCode => countryCode.id === monitoring.orgUnit)?.code
                                    : monitoring.orgUnit,
                        };
                    }),
                    userGroups: [dataNotificationsUserGroup],
                },
                "userGroup"
            ),
        ],
    });

    return {
        ...monitoringValue,
        dataSets: newDataSets,
    };
}

function combineMonitoringValues(
    initialMonitoringValues: Monitoring[],
    addedMonitoringValues: Monitoring[]
): Monitoring[] {
    const combinedMonitoringValues = addedMonitoringValues.map(added => {
        return initialMonitoringValues.filter(
            initial => initial.orgUnit !== added.orgUnit || initial.period !== added.period
        );
    });
    const combinedMonitoring = _.union(_.intersection(...combinedMonitoringValues), addedMonitoringValues);

    return _.union(combinedMonitoring);
}

const malDataNotificationsUserGroup = "MAL_Data_Notifications";
