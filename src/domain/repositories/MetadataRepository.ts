import { Config } from "../entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../entities/PaginatedObjects";
import { MetadataObject } from "../entities/MetadataObject";
import { Id } from "../entities/Base";

export interface MetadataRepository {
    get(options: MetadataRepositoryGetOptions): Promise<PaginatedObjects<MetadataObject>>;
    save(filename: string, metadataObjects: MetadataObject[]): Promise<void>;
}

export interface MetadataRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<MetadataObject>;
    sqlView?: Id;
    code: string;
    inPublicAccess: string[];
    notInPublicAccess: string[];
    fields?: string[];
}
