import React, { useContext } from "react";
import { D2Api } from "../../types/d2-api";
import { CompositionRoot } from "../../compositionRoot";
import { Config } from "../../domain/entities/Config";

export interface AppContext {
    api: D2Api;
    d2: object;
    config: Config;
    compositionRoot: CompositionRoot;
}

export const AppContext = React.createContext<AppContext | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
