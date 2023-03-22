import { UseCase } from "../../../../compositionRoot";
import { GLASSDataSubmissionItemIdentifier } from "../entities/GLASSDataSubmissionItem";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class UpdateGLASSSubmissionUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(
        namespace: string,
        action: UpdateAction,
        items: GLASSDataSubmissionItemIdentifier[],
        message?: string
    ): Promise<void> {
        switch (action) {
            case "approve":
                return this.submissionRepository.approve(namespace, items);
            case "reject":
                return this.submissionRepository.reject(namespace, items, message);
            case "reopen":
                return this.submissionRepository.reopen(namespace, items);
            default:
                return this.submissionRepository.reopen(namespace, items);
        }
    }
}

type UpdateAction = "approve" | "reject" | "reopen";
