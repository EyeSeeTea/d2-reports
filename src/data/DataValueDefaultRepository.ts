import _ from "lodash";
import { DataCommentsItem } from "../domain/nhwa-comments/entities/DataCommentsItem";
import {
    NHWADataCommentsRepository,
    NHWADataCommentsRepositoryGetOptions,
} from "../domain/nhwa-comments/repositories/NHWADataCommentsRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "./CsvDataSource";
import { DataValueRepository } from "../domain/validate-yesnopartial/repositories/DataValueRepository";
import { DataValue } from "../domain/entities/DataValue";
import { D2ApiRequestParamsValue } from "@eyeseetea/d2-api/api/common";
import { NamedRef } from "../domain/entities/Ref";
import { DataValueItem } from "../domain/validate-yesnopartial/entities/DataValueItem";
import { Component } from "react";
import { Config } from "../domain/common/entities/Config";

interface Variables {
    value: string;
    storedby: string;
    lastupdated: string;
    created: string;
    comment: string;
    ou_name: string;
    ou_uid: string;
    de_name: string;
    de_uid: string;
    pe_startdate: string;
    coc_name: string;
    coc_uid: string;
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
    | "pe_startdate"
    | "coc_name"
    | "coc_uid";

function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}

type DataValueRow = Record<string, string>;
const toName = { $fn: { name: "rename", to: "name" } } as const;
 
export class DataValueDefaultRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(config: Config): Promise<PaginatedObjects<DataValueItem>> { 
        const sqlViews = new Dhis2SqlViews(this.api);

        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                config.dataYesNoPartialSqlView.id
            )
            .getData();
        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const items: Array<DataValueItem> = rows.map(
            (item): DataValueItem => ({
                value: item.value,
                storedBy: item.storedby,
                lastUpdated: item.lastupdated,
                comment: item.comment,
                ou_name: item.ou_name,
                ou_uid: item.ou_uid,
                de_name: item.de_name,
                de_uid: item.de_uid,
                pe_startdate: item.pe_startdate,
                coc_name: item.coc_name,
                coc_uid: item.coc_uid,
                created: item.created,
            })
        );

        return { pager, objects: items };
    }

    async push(dataValues: DataValue[], remove: boolean): Promise<boolean | undefined> {
        if (remove) {
            const rows = dataValues.map(
                (dataValue): DataValueRow => ({
                    pe: dataValue.period,
                    ou: dataValue.orgUnit.name,
                    ds: dataValue.dataSet.name,
                    det: dataValue.dataElement.name,
                    co: dataValue.categoryOptionCombo.name,
                })
            );
            try {
                const response = await this.api.post<any>("/dataValues", {}, { rows }).getData();
                return response.status === "SUCCESS";
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
        }
    }
}
