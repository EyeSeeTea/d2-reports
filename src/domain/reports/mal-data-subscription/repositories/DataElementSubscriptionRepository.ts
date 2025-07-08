import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataElementSubscription } from "../entities/DataElementSubscription";
import { DataElementSubscriptionReport } from "../usecases/GetSubscriptionReportUseCase";

export interface DataElementSubscriptionRepository {
    get(options: DataElementSubscriptionOptions): Promise<DataElementSubscription[]>;
    getAll(): Promise<DataElementSubscription[]>;
}

export type DataElementSubscriptionOptions = {
    dataElementGroups: string[];
    sections: string[];
    paging: Paging;
    sorting: Sorting<DataElementSubscriptionReport>;
};
