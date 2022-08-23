import { D2Api, PaginatedObjects } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { DataValueItem, DataValueItemIdentifier } from "../domain/validate-yesnopartial/entities/DataValueItem";
import {
    NHWAYesNoPartialDataValuesRepository,
    NHWAYesNoPartialDataValuesRepositoryGetOptions,
} from "../domain/validate-yesnopartial/repositories/NHWAYesNoPartialDataValuesRepository";

const NO = "Y7EAGQA1bfv";
const PARTIAL = "Xgr3PJxcWfJ";
const YES = "I93t0K7b1oN";
const DEFAULT = "Xr12mI7VPn3";
interface Variables {
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

    dataValues: {
        period: string;
        orgUnit: string;
        dataElement: string;
        categoryOptionCombo: string;
        attributeOptionCombo: string;
        value?: boolean;
    }[] = [];
    dataValuesToBeDeleted: {
        period: string;
        orgUnit: string;
        dataElement: string;
        categoryOptionCombo: string;
        attributeOptionCombo: string;
        value?: boolean;
    }[] = [];

    async get(options: NHWAYesNoPartialDataValuesRepositoryGetOptions): Promise<PaginatedObjects<DataValueItem>> {
        const { paging, sorting } = options;
        const sqlViews = new Dhis2SqlViews(this.api);

        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                options.config.dataYesNoPartialSqlView.id,
                {
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

    async push(rows: DataValueItemIdentifier[], option: string): Promise<boolean> {
        rows.forEach(datavalue => {
            if (option === "yes") {
                if (datavalue.no === "1") {
                    this.prepareDataValue(datavalue, NO, "false");
                }
                if (datavalue.partial === "1") {
                    this.prepareDataValue(datavalue, PARTIAL, "false");
                }
                if (datavalue.yes === "0") {
                    this.prepareDataValue(datavalue, YES, "true");
                }
            } else if (option === "no") {
                if (datavalue.no === "0") {
                    //push no
                    this.prepareDataValue(datavalue, NO, "true");
                }
                if (datavalue.partial === "1") {
                    this.prepareDataValue(datavalue, PARTIAL, "false");
                }

                if (datavalue.yes === "1") {
                    this.prepareDataValue(datavalue, YES, "false");
                }
            } else if (option === "partial") {
                if (datavalue.no === "1") {
                    this.prepareDataValue(datavalue, NO, "false");
                }
                if (datavalue.partial === "0") {
                    this.prepareDataValue(datavalue, PARTIAL, "true");
                }

                if (datavalue.yes === "1") {
                    this.prepareDataValue(datavalue, YES, "false");
                }
            }
        });

        //send values
        try {
            if (this.dataValues.length > 0) {
                const responsePush = await this.api
                    .post<any>("/dataValueSets?importStrategy=CREATE&async=false", {}, { dataValues: this.dataValues })
                    .getData();
                this.dataValues = [];
                if (responsePush.status !== "SUCCESS") return false;
            }

            const responseDelete = await this.api
                .post<any>(
                    "/dataValueSets?importStrategy=DELETE&async=false",
                    {},
                    { dataValues: this.dataValuesToBeDeleted }
                )
                .getData();
            this.dataValuesToBeDeleted = [];
            if (responseDelete.status === "SUCCESS") return true;
            else return false;
        } catch (error: any) {
            return error;
        }
    }

    prepareDataValue(datavalue: DataValueItemIdentifier, categoryOptionCombo: string, value: string) {
        if (value === "true") {
            this.dataValues.push({
                period: datavalue.period,
                orgUnit: datavalue.orgUnit,
                dataElement: datavalue.dataElement,
                categoryOptionCombo: categoryOptionCombo,
                attributeOptionCombo: DEFAULT,
                value: true,
            });
        } else {
            this.dataValuesToBeDeleted.push({
                period: datavalue.period,
                orgUnit: datavalue.orgUnit,
                dataElement: datavalue.dataElement,
                categoryOptionCombo: categoryOptionCombo,
                attributeOptionCombo: DEFAULT,
            });
        }
    }
}
