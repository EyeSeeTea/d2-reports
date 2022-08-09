import { D2Api, Id, PaginatedObjects } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";

import { DataValueItem, DataValueItemIdentifier } from "../domain/validate-yesnopartial/entities/DataValueItem";
import {
    NHWAYesNoPartialDataValuesRepository,
    NHWAYesNoPartialDataValuesRepositoryGetOptions,
} from "../domain/validate-yesnopartial/repositories/NHWAYesNoPartialDataValuesRepository";

interface Variables {
    ou_uid: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type SqlField =
    | "value"
    | "storedby"
    | "lastupdated"
    | "created"
    | "comment"
    | "ou_name"
    | "ou_uid"
    | "de_name"
    | "de_uid"
    | "period"
    | "coc_name"
    | "coc_uid"
    | "yes"
    | "no"
    | "partial"
    | "count";

const fieldMapping: Record<keyof DataValueItem, SqlField> = {
    period: "period",
    ou_uid: "ou_uid",
    de_name: "de_name",
    lastUpdated: "lastupdated",
    storedBy: "storedby",
    ou_name: "ou_name",
    de_uid: "de_uid",
    coc_name: "coc_name",
    coc_uid: "coc_uid",
    value: "value",
    comment: "comment",
    created: "created",
    yes: "yes",
    no: "no",
    partial: "partial",
    count: "count",
};

export class NHWAYesNoPartialDataValuesDefaultRepository implements NHWAYesNoPartialDataValuesRepository {
    constructor(private api: D2Api) {}

    /*     get(options: NHWAYesNoPartialDataValuesRepositoryGetOptions): Promise<PaginatedObjects<DataValueItem>>;
    push(dataValues: DataValueItemIdentifier[], option: string): Promise<boolean>; */
    async get(options: NHWAYesNoPartialDataValuesRepositoryGetOptions): Promise<PaginatedObjects<DataValueItem>> {
        const { orgUnitIds } = options;
        const { paging, sorting } = options;
        const sqlViews = new Dhis2SqlViews(this.api);

        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                options.config.dataYesNoPartialSqlView.id,
                {
                    ou_uid: sqlViewJoinIds(orgUnitIds),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging
            )
            .getData();

        const items: DataValueItem[] = rows.map(
            (item): DataValueItem => ({
                value: item.value,
                storedBy: item.storedby,
                lastUpdated: item.lastupdated,
                comment: item.comment,
                ou_name: item.ou_name,
                ou_uid: item.ou_uid,
                de_name: item.de_name,
                de_uid: item.de_uid,
                period: item.period,
                coc_name: item.coc_name,
                coc_uid: item.coc_uid,
                created: item.created,
                yes: item.yes,
                no: item.no,
                partial: item.partial,
                count: item.count,
            })
        );
        if (items === undefined) {
            return { pager, objects: [] };
        } else {
            return { pager, objects: items };
        }
    }
    // eslint-disable-next-line
    async push(dataValues: DataValueItemIdentifier[], option: string): Promise<boolean> {
        return true;
        //todo
        /* 
        const rows = dataValues.map(
            (dataValue): DataValueRow => ({
                pe: dataValue.period,
                ou: dataValue.orgUnit.name,
                ds: dataValue.dataSet.name,
                det: dataValue.dataElement.name,
                co: "I93t0K7b1oN",
                value: true
            })
        );

    
        //yes -> I93t0K7b1oN
        //no -> Y7EAGQA1bfv
        //partial ->  Xgr3PJxcWfJ
        if (option === "yes"){

        }else{

        } 
        if (option === "no"){

        }else{

        } 
        if (option === "partial"){

        } else {

        }
        if (remove) {
            try {
                const response = await this.api.post<any>("/dataValues", {}, { rows }).getData();
                if (response.status === "SUCCESS")
                    return true;
                else
                    return false;
            } catch (error: any) {
                return error;
            }
        } else {
            const rows = dataValues.map(
                (dataValue): DataValueRow => ({
                    pe: dataValue.period,
                    ou: dataValue.orgUnit.name,
                    ds: dataValue.dataSet.name,
                    det: dataValue.dataElement.name,
                    co: dataValue.categoryOptionCombo.name,
                    value: dataValue.value,
                })
            );
            try {
                const response = await this.api.post<any>("/dataValues", {}, { rows }).getData();
                return response.status === "SUCCESS";
            } catch (error: any) {
                return error;
            }
        } */
    }
}
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}
