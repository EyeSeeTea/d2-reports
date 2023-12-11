import {
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
    GLASSDataMaintenanceItem,
    GLASSMaintenancePaginatedObjects,
    GLASSModule,
    Module,
    Status,
} from "../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import _ from "lodash";
import { Config } from "../../../domain/common/entities/Config";
import { Id } from "../../../domain/common/entities/Base";
import { Paging, Sorting } from "../../../domain/common/entities/PaginatedObjects";

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
        const orgUnits = await this.getCountries();

        const rows = this.getFilteredFiles(uploads, orgUnits, module);

        const rowIds = this.getRowIds(rows);
        const { objects, pager } = this.paginate(rows, sorting, paging);

        return { objects: objects, pager: pager, rowIds: rowIds };
    }

    async getUserModules(config: Config): Promise<GLASSModule[]> {
        const modules = await this.getModules();

        const userGroups = config.currentUser.userGroups;
        const userGroupIds = userGroups.map(userGroup => userGroup.id);

        const userModules = modules.filter(module => {
            const moduleUserGroupIds = module.userGroups.approveAccess?.map(userGroup => userGroup.id) ?? [];

            return _.some(moduleUserGroupIds, moduleUserGroupId => userGroupIds.includes(moduleUserGroupId));
        });

        return userModules;
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

    private async getCountries(): Promise<NamedRef[]> {
        const { organisationUnits } = await this.api
            .get<{ organisationUnits: NamedRef[] }>("/organisationUnits", {
                fields: "id, name",
                filter: "level:eq:3",
                paging: false,
            })
            .getData();

        return organisationUnits;
    }

    private async getModules(): Promise<GLASSModule[]> {
        const modules =
            (await this.globalStorageClient.getObject<GLASSModule[]>(Namespaces.DATA_SUBMISSSIONS_MODULES)) ?? [];

        return modules
            .map(module => ({
                id: module.id,
                name: module.name,
                userGroups: module.userGroups,
            }))
            .filter(module => module.name !== earModule);
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
            .map(upload => ({
                ...upload,
                id: upload.fileId,
                orgUnitName: orgUnits.find(ou => ou.id === upload.orgUnit)?.name ?? "",
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
                return _.assign({}, upload, { status: status });
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

    private getPaginatedObjects<T>(rows: T[], sorting: Sorting<T>, paging: Paging): T[] {
        return _(rows)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();
    }

    private paginate<T>(objects: T[], sorting: Sorting<T>, paging: Paging) {
        const pager = this.getPager(objects, paging);
        const paginatedObjects = this.getPaginatedObjects(objects, sorting, paging);

        return { pager, objects: paginatedObjects };
    }
}

const emptyPage = {
    pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 },
    objects: [],
    rowIds: [],
};

const earModule = "EAR";
