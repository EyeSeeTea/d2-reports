import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataElementSubscription } from "../entities/DataElementSubscription";

export interface DataElementSubscriptionRepository {
    get(options: DataElementSubscriptionOptions): Promise<PaginatedObjects<DataElementSubscription>>;
    getAll(): Promise<DataElementSubscription[]>;
}

export type DataElementSubscriptionOptions = {
    dataElementGroups: string[];
    paging: Paging;
    sections: string[];
    sorting: Sorting<DataElementSubscription>;
};
