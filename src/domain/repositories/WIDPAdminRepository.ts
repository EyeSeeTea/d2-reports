import { Sorting } from "../entities/PaginatedObjects";
import { MetadataObject } from "../entities/MetadataObject";

export interface WIDPAdminRepository {
    getPublicMetadata(options: WIDPAdmiRepositoryGetOptions): Promise<Array<MetadataObject>>;
    save(filename: string, metadataObjects: MetadataObject[]): Promise<void>;
}

export interface WIDPAdmiRepositoryGetOptions {
    sorting: Sorting<MetadataObject>;
}