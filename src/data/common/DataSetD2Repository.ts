import { Id } from "../../domain/common/entities/Base";
import { DataSet } from "../../domain/common/entities/DataSet";
import { DataSetRepository } from "../../domain/common/repositories/DataSetRepository";
import { D2Api } from "../../types/d2-api";

export class DataSetD2Repository implements DataSetRepository {
    constructor(private api: D2Api) {}

    async getById(id: Id): Promise<DataSet[]> {
        return this.api.metadata
            .get({
                dataSets: {
                    fields: {
                        id: true,
                        name: true,
                        dataSetElements: {
                            dataElement: {
                                id: true,
                                code: true,
                                name: true,
                                formName: true,
                                categoryCombo: {
                                    id: true,
                                    code: true,
                                    name: true,
                                    categoryOptionCombos: {
                                        id: true,
                                        code: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                        organisationUnits: {
                            id: true,
                            name: true,
                        },
                    },
                    filter: {
                        id: {
                            eq: id,
                        },
                    },
                },
            })
            .getData()
            .then(response =>
                response.dataSets.map(d2DataSet => {
                    return {
                        id: d2DataSet.id,
                        name: d2DataSet.name,
                        dataElements: d2DataSet.dataSetElements.map(d2DataElement => {
                            return {
                                id: d2DataElement.dataElement.id,
                                name: d2DataElement.dataElement.formName || d2DataElement.dataElement.name,
                                code: d2DataElement.dataElement.code,
                                categoryCombo: d2DataElement.dataElement.categoryCombo,
                            };
                        }),
                        organisationUnits: d2DataSet.organisationUnits.map(d2OrgUnit => {
                            return {
                                id: d2OrgUnit.id,
                                name: d2OrgUnit.name,
                                level: 0,
                                path: "",
                            };
                        }),
                    };
                })
            );
    }
}
