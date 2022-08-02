import { DataAttachmentItem } from "../entities/DataAttachmentItem";
import { Id } from "../../common/entities/Base";
import { Config } from "../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../common/entities/PaginatedObjects";

export interface NHWADataAttachmentsRepository {
    get(options: NHWADataAttachmentsRepositoryGetOptions): Promise<PaginatedObjects<DataAttachmentItem>>;
    save(filename: string, dataValues: DataAttachmentItem[]): Promise<void>;
}

export interface NHWADataAttachmentsRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataAttachmentItem>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
}
