import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { SummaryItem, SummaryType } from "../entities/SummaryItem";

export interface SummaryItemRepository {
    get(options: SummaryItemOptions): Promise<PaginatedObjects<SummaryItem>>;
    save(filename: string, items: SummaryItem[]): Promise<void>;
}

export interface SummaryItemOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<SummaryItem>;
    year: string;
    quarter?: string;
    orgUnitPaths: string[];
    summaryType: SummaryType;
}
