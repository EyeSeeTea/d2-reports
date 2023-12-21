import {
    ATCOptions,
    GLASSDataMaintenanceOptions,
    GLASSDataMaintenanceRepository,
} from "../../../domain/reports/glass-admin/repositories/GLASSDataMaintenanceRepository";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { NamedRef } from "../../../domain/common/entities/Ref";
import { D2Api, Pager } from "../../../types/d2-api";
import {
    ATCItem,
    ATCItemIdentifier,
    GLASSDataMaintenanceItem,
    GLASSMaintenancePaginatedObjects,
    GLASSModule,
    Module,
    Status,
    getUserModules,
} from "../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import JSZip from "jszip";
import _ from "lodash";
import { Config } from "../../../domain/common/entities/Config";
import { Id } from "../../../domain/common/entities/Base";
import {
    PaginatedObjects,
    Paging,
    Sorting,
    getPaginatedObjects,
} from "../../../domain/common/entities/PaginatedObjects";

interface ATCJson {
    [key: string]: any;
}

export class GLASSDataMaintenanceDefaultRepository implements GLASSDataMaintenanceRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(
        options: GLASSDataMaintenanceOptions,
        namespace: string
    ): Promise<GLASSMaintenancePaginatedObjects<GLASSDataMaintenanceItem>> {
        const { paging, sorting, module } = options;
        if (!module) return emptyPage;

        const uploads = await this.getUploads(namespace);
        const countries = await this.getCountries();

        const filteredFiles = this.getFilteredFiles(uploads, countries, module);

        const rowIds = this.getRowIds(filteredFiles);
        const { objects, pager } = this.paginate(filteredFiles, sorting, paging);

        return { objects: objects, pager: pager, rowIds: rowIds };
    }

    async getATCs(options: ATCOptions, namespace: string): Promise<PaginatedObjects<ATCItem>> {
        const { paging, sorting } = options;

        const atcs = await this.getATCItems(namespace);
        const { objects, pager } = this.paginate(atcs, sorting, paging);

        return { objects: objects, pager: pager };
    }

    private async getATCItems(namespace: string) {
        return (await this.globalStorageClient.getObject<ATCItem[]>(namespace)) ?? [];
    }

    async getUserModules(config: Config): Promise<GLASSModule[]> {
        const modules = await this.getModules();

        return getUserModules(modules, config.currentUser);
    }

    async delete(namespace: string, items: Id[]): Promise<void> {
        await this.deleteFileResources(items);

        const uploads = await this.getUploads(namespace);
        const updatedUploads = this.updateStatusById(items, uploads, "DELETED");
        return await this.globalStorageClient.saveObject<GLASSDataMaintenanceItem[]>(namespace, updatedUploads);
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    async uploadATC(namespace: string, file: File, year: string, items: ATCItemIdentifier[]): Promise<void> {
        const atcItems = await this.getATCItems(namespace);
        const jsons = await this.extractJsonFromZIP(file);

        if (jsons.length === 4) {
            if (items) {
                const updatedVersion = this.updateVersion(items);
                const updatedATCItems = this.patchATCVersion(atcItems, items);

                await this.globalStorageClient.saveObject<ATCJson>(`ATC-${updatedVersion}`, jsons);
                await this.globalStorageClient.saveObject<ATCJson>(Namespaces.ATCS, updatedATCItems);
            } else {
                const updatedATCItems = this.uploadNewATC(year, atcItems);

                await this.globalStorageClient.saveObject<ATCJson>(`ATC-${year}-v1`, jsons);
                await this.globalStorageClient.saveObject<ATCJson>(Namespaces.ATCS, updatedATCItems);
            }
        } else {
            throw new Error("The zip file does not contain exactly 4 JSON files.");
        }
    }

    private uploadNewATC(year: string, atcItems: ATCItem[]) {
        const atcYears = atcItems.map(atcItem => _.parseInt(atcItem.year));
        const currentVersionYear = Math.max(...atcYears);

        const newItem = {
            year: year,
            version: 1,
            uploadedDate: new Date().toISOString(),
            currentVersion: _.parseInt(year) > currentVersionYear,
        };

        return [...atcItems, newItem];
    }

    private patchATCVersion(atcItems: ATCItem[], selectedItems: ATCItemIdentifier[]) {
        return _.flatMap(atcItems, atcItem => {
            const matchingItem = _.find(selectedItems, { year: atcItem.year, version: atcItem.version });

            if (matchingItem) {
                return [
                    {
                        ...atcItem,
                        currentVersion: false,
                    },
                    {
                        year: matchingItem.year,
                        version: _.parseInt(matchingItem.version) + 1,
                        uploadedDate: new Date().toISOString(),
                        currentVersion: matchingItem.currentVersion === true,
                    },
                ];
            }

            return [atcItem];
        });
    }

    private async extractJsonFromZIP(file: File): Promise<ATCJson[]> {
        const zip = new JSZip();
        const jsonPromises: Promise<ATCJson>[] = [];
        const contents = await zip.loadAsync(file);

        contents.forEach((relativePath, file) => {
            if (file.dir) {
                return;
            }

            // Check if the file has a .json extension
            if (/\.(json)$/i.test(relativePath)) {
                const jsonPromise = file.async("string").then(content => {
                    try {
                        return JSON.parse(content) as ATCJson;
                    } catch (error) {
                        console.error(`Error parsing JSON from ${relativePath}: ${error}`);
                        throw error;
                    }
                });

                jsonPromises.push(jsonPromise);
            }
        });
        const jsons = await Promise.all(jsonPromises);

        return jsons;
    }

    private updateVersion(items: ATCItemIdentifier[]): string {
        const item = _.first(items);

        if (item) {
            return `${item.year}-v${item.version}`;
        } else {
            return "";
        }
    }

    private async getCountries(): Promise<NamedRef[]> {
        const { objects: organisationUnits } = await this.api.models.organisationUnits
            .get({
                fields: {
                    id: true,
                    name: true,
                },
                filter: {
                    level: { eq: "3" },
                },
                paging: false,
            })
            .getData();

        return organisationUnits;
    }

    private async getModules(): Promise<GLASSModule[]> {
        const modules =
            (await this.globalStorageClient.getObject<GLASSModule[]>(Namespaces.DATA_SUBMISSSIONS_MODULES)) ?? [];

        return _(modules)
            .map(module => ({ ...module, userGroups: { approveAccess: module.userGroups.approveAccess ?? [] } }))
            .filter(module => module.name !== earModule)
            .value();
    }

    private async getUploads(namespace: string): Promise<GLASSDataMaintenanceItem[]> {
        const uploads = (await this.globalStorageClient.getObject<GLASSDataMaintenanceItem[]>(namespace)) ?? [];

        return uploads;
    }

    private async deleteFileResources(items: Id[]): Promise<void> {
        _.forEach(items, async item => {
            try {
                await this.api.delete(`/documents/${item}`).getData();
            } catch (error) {
                console.debug("File does not exist");
            }
        });
    }

    private getFilteredFiles(files: GLASSDataMaintenanceItem[], orgUnits: NamedRef[], module: Module) {
        const lastDataSubmissionYear = new Date().getFullYear() - 1; // last submission year is the previous year

        return _(files)
            .map(file => ({
                ...file,
                id: file.fileId,
                orgUnitName: orgUnits.find(ou => ou.id === file.orgUnit)?.name ?? "",
            }))
            .filter(upload => {
                const isIncomplete = upload.status !== "COMPLETED";
                const isBeforeSubmissionYear = parseInt(upload.period, 10) < lastDataSubmissionYear;
                const isInModule = upload.module === module;

                return isIncomplete && isBeforeSubmissionYear && isInModule;
            })
            .value();
    }

    private updateStatusById(
        ids: string[],
        uploads: GLASSDataMaintenanceItem[],
        status: Status
    ): GLASSDataMaintenanceItem[] {
        return _.map(uploads, upload => {
            if (_.includes(ids, upload.fileId)) {
                return _.assign({ ...upload, status: status });
            }
            return upload;
        });
    }

    private getRowIds(rows: GLASSDataMaintenanceItem[]): string[] {
        return _(rows)
            .filter(row => row.status !== "DELETED")
            .map(row => row.id)
            .value();
    }

    private getPager<T>(rows: T[], paging: Paging): Pager {
        return {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(rows.length / paging.pageSize),
            total: rows.length,
        };
    }

    private paginate<T>(objects: T[], sorting: Sorting<T>, paging: Paging) {
        const pager = this.getPager(objects, paging);
        const paginatedObjects = getPaginatedObjects(objects, sorting, paging);

        return { pager, objects: paginatedObjects };
    }
}

const emptyPage: GLASSMaintenancePaginatedObjects<GLASSDataMaintenanceItem> = {
    pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 },
    objects: [],
    rowIds: [],
};

const earModule = "EAR";
