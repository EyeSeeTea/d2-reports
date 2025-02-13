import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalItemIdentifier, MalDataSet } from "../entities/MalDataApprovalItem";
import { UserGroupRepository } from "../repositories/UserGroupRepository";
import { CountryCodeRepository } from "../repositories/CountryCodeRepository";
import { CountryCode } from "../entities/CountryCode";
import { MonitoringValueRepository } from "../repositories/MonitoringValueRepository";
import { Monitoring, MonitoringValue } from "../entities/MonitoringValue";

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
        private countryCodeRepository: CountryCodeRepository,
        private userGroupRepository: UserGroupRepository
    ) {}

    async execute(options: UpdateMonitoringUseCaseOptions): Promise<void> {
        const { namespace, monitoringValue, dataApprovalItems, dataSetName, enableMonitoring } = options;

        const dataNotificationsUserGroup = await this.userGroupRepository.getUserGroupByCode(
            malDataNotificationsUserGroup
        );
        const countryCodes = await this.countryCodeRepository.getCountryCodes();
        const monitoring = buildMonitoringValue(
            monitoringValue,
            dataApprovalItems,
            dataSetName,
            countryCodes,
            dataNotificationsUserGroup,
            enableMonitoring
        );

        return this.monitoringValueRepository.save(namespace, monitoring);
    }
}

function buildMonitoringValue(
    monitoringValue: MonitoringValue,
    dataApprovalItems: MalDataApprovalItemIdentifier[],
    dataSetName: MalDataSet,
    countryCodes: CountryCode[],
    dataNotificationsUserGroup: string,
    enableMonitoring: boolean
): MonitoringValue {
    const addedMonitoringValues = dataApprovalItems.map(item => {
        return {
            orgUnit: item.orgUnit,
            period: item.period,
            enable: enableMonitoring,
        };
    });

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
