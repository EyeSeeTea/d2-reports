import _ from "lodash";
import { DashboardSubscriptionItemIdentifier, MonitoringValue } from "../entities/MalDataSubscriptionItem";
import { DataElementSubscriptionRepository } from "../repositories/DataElementSubscriptionRepository";
import { MonitoringRepository } from "../repositories/MonitoringRepository";

export class UpdateMonitoringUseCase {
    constructor(
        private dataElementSubscriptionRepository: DataElementSubscriptionRepository,
        private monitoringRepository: MonitoringRepository
    ) {}

    async execute(
        items: DashboardSubscriptionItemIdentifier[],
        subscriptionEnabled: boolean,
        userIds: string[]
    ): Promise<void> {
        const dataElementSubscriptionItems = await this.dataElementSubscriptionRepository.getAll();
        const monitoring = await this.monitoringRepository.get();

        const subscriptionDetails = _(items)
            .flatMap(item =>
                item.dataElementIds.map(item => {
                    const matchingSubscriptionItem = dataElementSubscriptionItems.find(
                        subscriptionItem => subscriptionItem.dataElementId === item
                    );
                    if (!matchingSubscriptionItem) return undefined;

                    return {
                        dataSet: matchingSubscriptionItem.dataSetName,
                        dataElements: [matchingSubscriptionItem.dataElementCode ?? ""],
                    };
                })
            )
            .compact()
            .value();

        const updatedMonitoringValues = getMonitoringJson(
            monitoring,
            subscriptionDetails,
            subscriptionEnabled,
            userIds
        );
        return await this.monitoringRepository.save(updatedMonitoringValues);
    }
}

// to-do: refactor this function
const getMonitoringJson = (
    initialMonitoringValue: any,
    newValues: { dataSet: string; dataElements: string[] }[],
    enabled: boolean,
    users: string[]
): MonitoringValue => {
    const { dataElements: initialDataElements } = initialMonitoringValue;
    const dataElements = _.chain(newValues)
        .groupBy("dataSet")
        .map((groupedData, dataSet) => ({
            dataElements: _.flatMap(groupedData, "dataElements"),
            dataSet,
            enabled,
            users,
        }))
        .value();

    if (!initialDataElements && !enabled) {
        return {
            ...initialMonitoringValue,
            dataElements: [],
        };
    } else if (!initialDataElements && enabled) {
        return {
            ...initialMonitoringValue,
            dataElements,
        };
    } else if (initialDataElements && enabled) {
        return {
            ...initialMonitoringValue,
            dataElements: _.chain(initialDataElements)
                .concat(dataElements)
                .groupBy("dataSet")
                .map(groupedData => ({
                    ...groupedData[0],
                    dataElements: _.union(...groupedData.map(element => element.dataElements)),
                }))
                .value(),
        };
    } else {
        return {
            ...initialMonitoringValue,
            dataElements: _.map(initialDataElements, initialDataElement => {
                const matchingElement = _.find(dataElements, { dataSet: initialDataElement.dataSet });

                if (matchingElement) {
                    return {
                        ...initialDataElement,
                        dataElements: _.difference(initialDataElement.dataElements, matchingElement.dataElements),
                    };
                }
                return initialDataElement;
            }),
        };
    }
};
