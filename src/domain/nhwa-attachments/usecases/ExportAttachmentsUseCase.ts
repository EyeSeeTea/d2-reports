import {
    NHWADataAttachmentsRepository,
    NHWADataAttachmentsRepositoryGetOptions,
} from "../repositories/NHWADataAttachmentsRepository";

export class ExportAttachmentsUseCase {
    constructor(private attachmentRepository: NHWADataAttachmentsRepository) {}

    async execute(options: NHWADataAttachmentsRepositoryGetOptions): Promise<void> {
        const attachments = await this.attachmentRepository.get(options);
        await this.attachmentRepository.save("data-values.csv", attachments.objects);
    }
}
