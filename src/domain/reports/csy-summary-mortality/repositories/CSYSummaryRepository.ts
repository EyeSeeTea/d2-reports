import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { SummaryItem } from "../entities/SummaryItem";

export interface CSYSummaryRepository {
    get(options: CSYSummaryOptions): Promise<PaginatedObjects<SummaryItem>>;
    save(filename: string, items: SummaryItem[]): Promise<void>;
}

export interface CSYSummaryOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<SummaryItem>;
    year: string;
    quarter?: string;
    orgUnitPaths: string[];
    summaryType: string;
}
