export type TableSettings<T> = {
    name: string;
    visibleColumns: Array<keyof T>;
};
