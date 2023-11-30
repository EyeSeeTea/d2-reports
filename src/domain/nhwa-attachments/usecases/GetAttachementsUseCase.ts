import {
    NHWADataAttachmentsRepository,
    NHWADataAttachmentsRepositoryGetOptions,
} from "../repositories/NHWADataAttachmentsRepository";
import { DataAttachmentItem } from "../entities/DataAttachmentItem";
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";

type GetAttachementsUseCaseOptions = NHWADataAttachmentsRepositoryGetOptions;

export class GetAttachementsUseCase {
    constructor(private attachmentRepository: NHWADataAttachmentsRepository) {}

    async execute(options: GetAttachementsUseCaseOptions): Promise<PaginatedObjects<DataAttachmentItem>> {
        return this.attachmentRepository.get(options);
    }
}
