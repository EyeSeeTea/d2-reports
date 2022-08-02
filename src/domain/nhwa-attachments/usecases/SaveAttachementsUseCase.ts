import { DataAttachmentItem } from "../entities/DataAttachmentItem";
import { NHWADataAttachmentsRepository } from "../repositories/NHWADataAttachmentsRepository";

export class SaveAttachementsUseCase {
    constructor(private dataValueRepository: NHWADataAttachmentsRepository) {}

    async execute(filename: string, dataValues: DataAttachmentItem[]): Promise<void> {
        this.dataValueRepository.save(filename, dataValues);
    }
}
