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

export function getPaginatedObjects<T>(rows: T[], sorting: Sorting<T>, paging: Paging): T[] {
    return _(rows)
        .orderBy([row => row[sorting.field]], [sorting.direction])
        .drop((paging.page - 1) * paging.pageSize)
        .take(paging.pageSize)
        .value();
}
