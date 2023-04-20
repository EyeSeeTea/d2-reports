import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { SummaryItem } from "../../../domain/reports/csy-summary/entities/SummaryItem";
import {
    CSYSummaryOptions,
    CSYSummaryRepository,
} from "../../../domain/reports/csy-summary/repositories/CSYSummaryRepository";
import { D2Api } from "../../../types/d2-api";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";

export class CSYSummaryDefaultRepository implements CSYSummaryRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(_options: CSYSummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };
    }

    async save(filename: string, items: SummaryItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = items.map(
            (dataValue): SummaryItemRow => ({
                group: dataValue.group,
                subGroup: dataValue.subGroup,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const csvFields = ["group", "subGroup"] as const;

type CsvField = typeof csvFields[number];

type SummaryItemRow = Record<CsvField, string>;
