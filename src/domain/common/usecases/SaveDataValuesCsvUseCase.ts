import { DataCommentsItem } from "../../nhwa-comments/entities/DataCommentsItem";
import { NHWADataCommentsRepository } from "../../nhwa-comments/repositories/NHWADataCommentsRepository";

export class SaveDataValuesUseCase {
    constructor(private dataValueRepository: NHWADataCommentsRepository) {}

    async execute(filename: string, dataValues: DataCommentsItem[]): Promise<void> {
        this.dataValueRepository.save(filename, dataValues);
    }
}
