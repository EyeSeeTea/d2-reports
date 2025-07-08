import { paginate, PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataElementSubscription } from "../entities/DataElementSubscription";
import {
    DashboardSubscriptionOptions,
    DashboardSubscriptionRepository,
} from "../repositories/DashboardSubscriptionRepository";
import {
    DataElementSubscriptionOptions,
    DataElementSubscriptionRepository,
} from "../repositories/DataElementSubscriptionRepository";
import { SubscriptionStatusRepository } from "../repositories/SubscriptionStatusRepository";
import { SubscriptionStatus } from "../entities/SubscriptionStatus";
import { Id } from "../../../common/entities/Base";
import {
    VisualizationSubscriptionOptions,
    VisualizationSubscriptionRepository,
} from "../repositories/VisualizationSubscriptionRepository";
import _ from "lodash";
import { SubscriptionValue } from "../entities/MalDataSubscriptionItem";

export class GetSubscriptionReportUseCase {
    constructor(
        private options: {
            dataElementSubscriptionRepository: DataElementSubscriptionRepository;
            dashboardSubscriptionRepository: DashboardSubscriptionRepository;
            subscriptionStatusRepository: SubscriptionStatusRepository;
            visualizationSubscriptionRepository: VisualizationSubscriptionRepository;
        }
    ) {}

    async execute(optionsByReportType: SubscriptionReportOptions): Promise<SubscriptionReport> {
        const subscriptionStatusList = await this.options.subscriptionStatusRepository.get();
        const { type, options } = optionsByReportType;

        switch (type) {
            case "dataElements": {
                const dataElementSubscription = await this.options.dataElementSubscriptionRepository.get(
                    optionsByReportType.options
                );
                const dataElementSubscriptionReport = this.buildDataElementSubscriptionReport(
                    dataElementSubscription,
                    subscriptionStatusList
                );

                return paginate(dataElementSubscriptionReport, options.paging, options.sorting);
            }
            case "dashboards":
            case "visualizations": {
                const subscriptionWithChildrenReport = await this.getSubscriptionWithChildrenReportByType(
                    optionsByReportType,
                    subscriptionStatusList
                );

                return paginate(subscriptionWithChildrenReport, options.paging, options.sorting);
            }
        }
    }

    private async getSubscriptionWithChildrenReportByType(
        options: SubscriptionReportOptions,
        subscriptionStatus: SubscriptionStatus[]
    ): Promise<SubscriptionWithChildrenReport[]> {
        switch (options.type) {
            case "dashboards": {
                const dashboardSubscription = await this.options.dashboardSubscriptionRepository.get(options.options);

                return dashboardSubscription.map(subscriptionItem => {
                    const children = this.buildDataElementSubscriptionReport(
                        subscriptionItem.children,
                        subscriptionStatus
                    );

                    const { lastDateOfSubscription, subscribedElements, subscription } = this.getSubscriptionDetails(
                        subscriptionItem,
                        subscriptionStatus,
                        children
                    );

                    return {
                        ...subscriptionItem,
                        children: children,
                        subscribedElements: subscribedElements.toString(),
                        subscription: subscription,
                        lastDateOfSubscription: lastDateOfSubscription,
                    };
                });
            }
            case "visualizations": {
                const visualizationSubscription = await this.options.visualizationSubscriptionRepository.get(
                    options.options
                );

                return visualizationSubscription.map(subscriptionItem => {
                    const children = this.buildDataElementSubscriptionReport(
                        subscriptionItem.children,
                        subscriptionStatus
                    );

                    const { lastDateOfSubscription, subscribedElements, subscription } = this.getSubscriptionDetails(
                        subscriptionItem,
                        subscriptionStatus,
                        children
                    );

                    return {
                        ...subscriptionItem,
                        children: children,
                        subscribedElements: subscribedElements.toString(),
                        subscription: subscription,
                        lastDateOfSubscription: lastDateOfSubscription,
                    };
                });
            }
            default:
                throw new Error(`Unsupported report type: ${options.type}`);
        }
    }

    private getSubscriptionDetails(
        subscriptionItem: { id: Id },
        subscriptionStatus: SubscriptionStatus[],
        dataElements: DataElementSubscriptionReport[]
    ): {
        lastDateOfSubscription: string;
        subscribedElements: number;
        subscription: SubscriptionValue;
    } {
        const lastDateOfSubscription =
            subscriptionStatus.find(subscription => subscription.dashboardId === subscriptionItem.id)
                ?.lastDateOfSubscription || "";

        const subscribedElements = _.intersection(
            subscriptionStatus
                .filter(subscription => subscription.subscribed)
                .map(subscription => subscription.dataElementId),
            dataElements.map(child => child.dataElementId)
        ).length;

        const subscription =
            subscribedElements !== 0 && subscribedElements !== dataElements.length
                ? "Subscribed to some elements"
                : subscribedElements !== 0 && subscribedElements === dataElements.length
                ? "Subscribed"
                : "Not Subscribed";

        return {
            lastDateOfSubscription: lastDateOfSubscription,
            subscribedElements: subscribedElements,
            subscription: subscription,
        };
    }

    private buildDataElementSubscriptionReport(
        objects: DataElementSubscription[],
        subscriptionStatusFromDatastore: SubscriptionStatus[]
    ): DataElementSubscriptionReport[] {
        return objects.map(deSubscription => {
            const subscriptionValue = subscriptionStatusFromDatastore.find(
                subscription => subscription.dataElementId === deSubscription.dataElementId
            );
            const subscription = !!subscriptionValue?.subscribed;

            return {
                ...deSubscription,
                subscription: subscription ? "Subscribed" : "Not Subscribed",
                lastDateOfSubscription: subscriptionValue?.lastDateOfSubscription,
                type: "dataElements" as const,
            };
        });
    }
}

type SubscriptionReportOptions =
    | {
          type: "dataElements";
          options: DataElementSubscriptionOptions;
      }
    | {
          type: "dashboards";
          options: DashboardSubscriptionOptions;
      }
    | {
          type: "visualizations";
          options: VisualizationSubscriptionOptions;
      };

export type DataElementSubscriptionReport = DataElementSubscription & {
    type: "dataElements";
    subscription: SubscriptionValue;
    lastDateOfSubscription?: string;
};

export type SubscriptionWithChildrenReport = {
    type: "dashboards" | "visualizations";
    id: Id;
    name: string;
    subscribedElements: string;
    subscription: SubscriptionValue;
    lastDateOfSubscription: string;
    children: DataElementSubscriptionReport[];
};

export type SubscriptionReport = PaginatedObjects<DataElementSubscriptionReport | SubscriptionWithChildrenReport>;
