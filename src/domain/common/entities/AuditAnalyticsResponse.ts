import _ from "lodash";
import { AuditItem } from "../../reports/csy-audit-trauma/entities/AuditItem";

export type AuditAnalyticsResponse = {
    rows: string[][];
    headers: { name: string }[];
};

export class AuditAnalyticsData {
    public readonly rows: Array<string[]>;
    public readonly headers: { name: string }[];

    constructor(analyticsResponse: AuditAnalyticsResponse) {
        this.rows = analyticsResponse.rows;
        this.headers = analyticsResponse.headers;
    }

    public getColumnValues(columnId: string): string[] {
        const columnIndex = this.getColumnIndex(columnId);
        const values = _(this.rows)
            .map(row => row[columnIndex])
            .compact()
            .value();

        return values;
    }

    public getColumnIndex(columnId: string): number {
        const columnHeader = this.headers.find(header => header.name === columnId);
        if (!columnHeader) return -1;

        return this.headers.indexOf(columnHeader);
    }
}

export function buildRefs(ids: string[]): AuditItem[] {
    return ids.map(id => ({ registerId: id }));
}

export function getEventQueryString(
    programId: string,
    programStageId: string,
    orgUnitIds: string,
    period: string,
    query: string
) {
    const eventQueryString = `/analytics/events/query/${programId}.json?dimension=pe:${period}&dimension=ou:${orgUnitIds}&stage=${programStageId}${query}&pageSize=100000`;

    return eventQueryString;
}
