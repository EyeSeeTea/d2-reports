import { UploadStatus } from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";

const STATUS_ORDER: readonly UploadStatus[] = ["COMPLETED", "VALIDATED", "IMPORTED", "UPLOADED", "DELETED"];

export function getUploadStatusSortKey(uploadStatuses: UploadStatus[]): string {
    const counts = uploadStatuses.reduce<Readonly<Record<UploadStatus, number>>>(
        (acc, s) => ({ ...acc, [s]: acc[s] + 1 }),
        { COMPLETED: 0, VALIDATED: 0, IMPORTED: 0, UPLOADED: 0, DELETED: 0 }
    );

    const pad = (n: number) => String(n).padStart(6, "0");
    return STATUS_ORDER.map(st => pad(counts[st])).join("|");
}
