import { UseCase } from "../../../../compositionRoot";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class SaveEARDataSubmissionColumnsUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.submissionRepository.saveEARColumns(namespace, columns);
    }
}
