import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DashboardSubscription } from "../entities/DashboardSubscription";
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

export class GetSubscriptionReportUseCase {
    constructor(
        private dataElementSubscriptionRepository: DataElementSubscriptionRepository,
        private dashboardSubscriptionRepository: DashboardSubscriptionRepository,
        private subscriptionStatusRepository: SubscriptionStatusRepository
    ) {}

    async execute(optionsByReportType: SubscriptionReportOptions): Promise<SubscriptionReport> {
        const subscriptionStatusFromDatastore = await this.subscriptionStatusRepository.getSubscription(
            Namespaces.MAL_SUBSCRIPTION_STATUS
        );

        switch (optionsByReportType.type) {
            case "dataElement": {
                const { objects, pager } = await this.dataElementSubscriptionRepository.get(
                    optionsByReportType.options
                );
                const dataElementSubscriptionReport = this.buildDataElementSubscriptionReport(
                    objects,
                    subscriptionStatusFromDatastore
                );

                return { objects: dataElementSubscriptionReport, pager: pager };
            }
            case "dashboard": {
                const { objects, pager } = await this.dashboardSubscriptionRepository.get(optionsByReportType.options);

                const dashboardSubscriptionReport = objects.map(dashboardSubscription => {
                    const children = this.buildDataElementSubscriptionReport(
                        dashboardSubscription.children,
                        subscriptionStatusFromDatastore
                    );

                    return {
                        dashboard: dashboardSubscription.dashboard,
                        children: children,
                    };
                });

                return { objects: dashboardSubscriptionReport, pager: pager };
            }
        }
    }

    private buildDataElementSubscriptionReport(
        objects: DataElementSubscription[],
        subscriptionStatusFromDatastore: SubscriptionStatus[]
    ): DataElementSubscriptionReport[] {
        return objects.map(deSubscription => {
            const subscriptionValue = subscriptionStatusFromDatastore.find(
                subscription => subscription.dataElementId === deSubscription.dataElement.id
            );
            const subscription = !!subscriptionValue?.subscribed;

            return {
                ...deSubscription,
                subscription: subscription,
                lastDateOfSubscription: subscriptionValue?.lastDateOfSubscription,
            };
        });
    }
}

type SubscriptionReportOptions =
    | {
          type: "dataElement";
          options: DataElementSubscriptionOptions;
      }
    | {
          type: "dashboard";
          options: DashboardSubscriptionOptions;
      };

type SubscriptionReportData = {
    subscription: boolean;
    lastDateOfSubscription?: string;
};
type DataElementSubscriptionReport = DataElementSubscription & SubscriptionReportData;
type DashboardSubscriptionReport = {
    dashboard: DashboardSubscription["dashboard"];
    children: DataElementSubscriptionReport[];
};

type SubscriptionReport = PaginatedObjects<DataElementSubscriptionReport | DashboardSubscriptionReport>;
