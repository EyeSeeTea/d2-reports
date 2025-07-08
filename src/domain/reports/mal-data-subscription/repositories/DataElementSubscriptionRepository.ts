import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataElementSubscription, SubscriptionFilterOptions } from "../entities/DataElementSubscription";
import { DataElementSubscriptionReport } from "../usecases/GetSubscriptionReportUseCase";

export interface DataElementSubscriptionRepository {
    get(options: DataElementSubscriptionOptions): Promise<DataElementSubscription[]>;
    getAll(): Promise<DataElementSubscription[]>;
}

export type DataElementSubscriptionOptions = {
    filterOptions: SubscriptionFilterOptions;
    paging: Paging;
    sorting: Sorting<DataElementSubscriptionReport>;
};
