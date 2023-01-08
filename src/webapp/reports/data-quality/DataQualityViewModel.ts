import { Config } from "../../../domain/common/entities/Config";
import { DataQualityItem } from "../../../domain/reports/data-quality/entities/DataQualityItem";

export interface DataQualityViewModel {
    id: string;
    lastUpdated: string;
    name: string;
    user: string;
    metadataType: string;
    denominator?: string;
    denominatorresult?: boolean;
    numerator?: string;
    numeratorresult?: boolean;
    expression?: string;
    expressionresult?: boolean;
    filter?: string;
    filterresult?: boolean;
}

export function getDataQualityIndicatorViews(_config: Config, items: DataQualityItem[]): DataQualityViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            denominator: item.denominator,
            denominatorresult: item.denominatorresult,
            lastUpdated: item.lastUpdated,
            name: item.name,
            numerator: item.numerator,
            numeratorresult: item.numeratorresult,
            user: item.user,
            metadataType: item.metadataType,
        };
    });
}

export function getDataQualityProgramIndicatorViews(_config: Config, items: DataQualityItem[]): DataQualityViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            expression: item.expression,
            expressionresult: item.expressionresult,
            lastUpdated: item.lastUpdated,
            name: item.name,
            filter: item.filter,
            filterresult: item.filterresult,
            user: item.user,
            metadataType: item.metadataType,
        };
    });
}
