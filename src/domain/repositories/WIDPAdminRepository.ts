import { Config } from "../entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../entities/PaginatedObjects";
import { MetadataObject } from "../entities/MetadataObject";
import { Id } from "../entities/Base";

export interface WIDPAdminRepository {
    getPublicMetadata(): Promise<Array<MetadataObject>>;
    save(filename: string, metadataObjects: MetadataObject[]): Promise<void>;
}
