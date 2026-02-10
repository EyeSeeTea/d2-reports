import { Id } from "../../common/entities/Base";
import { WmrQuestion } from "../entities/WmrQuestion";

export interface WmrQuestionRepository {
    getByIds(ids: Id[]): Promise<WmrQuestion[]>;
    clone(questions: WmrQuestion[], idsToClone: Id[], options: PersistOptions): Promise<void>;
}

export type PersistOptions = { persist: boolean; export: boolean };
