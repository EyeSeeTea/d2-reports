import { UseCase } from "../../../../compositionRoot";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class GetEARDataSubmissionColumnsUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.submissionRepository.getEARColumns(namespace);
    }
}
