import { userInfo } from "os";
import { string } from "purify-ts";
import { Id } from "../../../domain/common/entities/Base";
import { Indicator } from "../../../domain/common/entities/Indicator";

export interface DataQualityReportViewModel {
    id: Id;
    name: string;
    shortName: string;
    metadataType: string;
    numerator: string;
    nominator_error: string;
    denominator_error: string;
    filter_error: string;
    expression: string;
    denominator: string;
    filter: string;
    publicAccess: string;
    createdBy: string;
    lastUpdatedBy: string;
    userGroupAccess: string;
    userAccess: string;
    created: string;
    lastUpdated: string;
}

export function getDataQualityReportViews(indicatorObject: Indicator[]): DataQualityReportViewModel[] {
    return indicatorObject.map(object => {
        return {
            id: object.id,
            name: object.name,
            shortName: object.shortName,
            metadataType: object.metadataType,
            numerator: object.numerator,
            nominator_error: object.nominator_error ?? "-",
            denominator: object.denominator,
            denominator_error: object.denominator_error ?? "-",
            filter: object.filter,
            filter_error: object.filter_error ?? "-",
            expression: object.expression,
            publicAccess: object.publicAccess,
            createdBy: object.createdBy ?? "-",
            lastUpdatedBy: object.lastUpdatedBy ?? "-",
            userGroupAccess: object.userGroupAccess ?? "-",
            userAccess: object.userAccess ?? "-",
            created: object.created ?? "-",
            lastUpdated: object.lastUpdated ?? "-",
        };
    });
}
