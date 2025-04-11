import { Id } from "../../common/entities/Base";
import { WmrForm } from "../entities/WmrForm";
import { PersistOptions } from "./WmrQuestionRepository";

export interface WmrFormRepository {
    getById(id: Id): Promise<WmrForm>;
    save(form: WmrForm, options: PersistOptions): Promise<void>;
}
