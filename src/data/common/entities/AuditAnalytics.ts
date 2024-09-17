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
