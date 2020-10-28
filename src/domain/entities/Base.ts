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
