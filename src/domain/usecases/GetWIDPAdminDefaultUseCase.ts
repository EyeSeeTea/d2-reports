
import { MetadataObject } from "../entities/MetadataObject";
import { WIDPAdminRepository, WIDPAdmiRepositoryGetOptions } from "../repositories/WIDPAdminRepository";


export class GetWIDPAdminDefaultUseCase {
    constructor(private metadataRepository: WIDPAdminRepository) { }

    execute(options: WIDPAdmiRepositoryGetOptions): Promise<Array<MetadataObject>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.metadataRepository.getPublicMetadata(options);
    }
}