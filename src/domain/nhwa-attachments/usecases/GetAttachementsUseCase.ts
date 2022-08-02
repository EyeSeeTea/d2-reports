import {
    NHWADataAttachmentsRepository,
    NHWADataAttachmentsRepositoryGetOptions,
} from "../repositories/NHWADataAttachmentsRepository";
import { DataAttachmentItem } from "../entities/DataAttachmentItem";
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";

type GetAttachementsUseCaseOptions = NHWADataAttachmentsRepositoryGetOptions;

export class GetAttachementsUseCase {
    constructor(private dataValueRepository: NHWADataAttachmentsRepository) {}

    execute(options: GetAttachementsUseCaseOptions): Promise<PaginatedObjects<DataAttachmentItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
