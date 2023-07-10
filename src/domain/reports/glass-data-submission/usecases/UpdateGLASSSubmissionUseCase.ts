import { UseCase } from "../../../../compositionRoot";
import { GLASSDataSubmissionItemIdentifier } from "../entities/GLASSDataSubmissionItem";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class UpdateGLASSSubmissionUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(
        namespace: string,
        action: UpdateAction,
        items: GLASSDataSubmissionItemIdentifier[],
        message?: string,
        isDatasetUpdate?: boolean
    ): Promise<void> | Promise<string> | undefined {
        switch (action) {
            case "approve":
                return this.submissionRepository.approve(namespace, items);
            case "reject":
                return this.submissionRepository.reject(namespace, items, message, isDatasetUpdate);
            case "reopen":
                return this.submissionRepository.reopen(namespace, items);
            case "accept":
                return this.submissionRepository.accept(namespace, items);
            case "unapvdDashboard":
                return this.submissionRepository.getGLASSDashboardId(namespace, items);
            default:
                return;
        }
    }
}

type UpdateAction = "approve" | "reject" | "reopen" | "accept" | "unapvdDashboard";
