
import _ from "lodash";
import { CustomFormErrorsRepository } from "../domain/validatecustomforms/repositories/CustomFormErrorsRepository";
import { D2Api } from "../types/d2-api";

export class CustomFormErrorsDefaultRepository implements CustomFormErrorsRepository {
    constructor(private api: D2Api) {}
    async get(id:string): Promise<string[]> {
        //http://localhost:8080/api/metadata.json?dataSets:fields=id,name,dataSetElements[dataElement[id,categoryCombo[id]&categoryCombos:fields=id,categoryOptionCombos&filter=id:eq:Tu81BTLUuCT

    // eslint-disable-next-line
    debugger;
        const dataSetMetadata: any = await this.api.metadata.d2Api
            .get(
                "/metadata.json?dataSets:fields=id,name,dataEntryForm[htmlCode],dataSetElements[dataElement[id,categoryCombo[id]&categoryCombos:fields=id,categoryOptionCombos"
            )
            .getData();
            // eslint-disable-next-line
        const dataSets = dataSetMetadata["dataSets"]
        // eslint-disable-next-line
        debugger
        // eslint-disable-next-line
        const filtered = _.filter(dataSets, dataset => dataset.id === id);

        // eslint-disable-next-line
        debugger
        // eslint-disable-next-line
        const htmlCode = filtered[0]["dataEntryForm"]["htmlCode"]
        const newRegExp = new RegExp('((([a-zA-Z0-9]){11})-(([a-zA-Z0-9]){11})-val)')
        // eslint-disable-next-line
        const result = newRegExp.exec(htmlCode)

        const result_2 = [...htmlCode.matchAll(newRegExp)]
        // eslint-disable-next-line
        debugger
        //return this.mapMetadataObjects(Object.assign(publicAccessResult, userGroupAccessesResult), options);
        return ["Error example"]
    }
}