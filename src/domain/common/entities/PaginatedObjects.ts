import _ from "lodash";

export interface PaginatedObjects<T> {
    pager: Pager;
    objects: T[];
}

export interface Pager {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
}

export interface Paging {
    page: number;
    pageSize: number;
}

export interface Sorting<T> {
    field: keyof T;
    direction: "asc" | "desc";
}

export const emptyPage = { pager: { page: 1, pageCount: 1, pageSize: 20, total: 1 }, objects: [] };

export function getPaginatedObjects<T>(rows: T[], sorting: Sorting<T>, paging: Paging): T[] {
    return _(rows)
        .orderBy([row => row[sorting.field]], [sorting.direction])
        .drop((paging.page - 1) * paging.pageSize)
        .take(paging.pageSize)
        .value();
}

export function getPager<T>(rows: T[], paging: Paging): Pager {
    return {
        page: paging.page,
        pageSize: paging.pageSize,
        pageCount: Math.ceil(rows.length / paging.pageSize),
        total: rows.length,
    };
}

export function paginate<T>(objects: T[], sorting: Sorting<T>, paging: Paging) {
    const pager = getPager(objects, paging);
    const paginatedObjects = getPaginatedObjects(objects, sorting, paging);

    return { pager, objects: paginatedObjects };
}
