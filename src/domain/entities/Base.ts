import _ from "lodash";

export type Id = string;

export interface Ref {
    id: Id;
}

export interface NamedRef extends Ref {
    name: string;
}

export function getId<T extends Ref>(obj: T): Id {
    return obj.id;
}

export function getIds<T extends Ref>(objs: T[]): Id[] {
    return objs.map(obj => obj.id);
}

export function keyById<T extends Ref>(objs: T[]): Record<Id, T> {
    return _.keyBy(objs, getId);
}
