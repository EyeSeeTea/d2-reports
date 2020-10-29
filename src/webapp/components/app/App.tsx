//@ts-ignore
import { useConfig } from "@dhis2/app-runtime";
import { LinearProgress } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { init } from "d2";
import { SnackbarProvider } from "d2-ui-components";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
//@ts-ignore
import { HeaderBar } from "@dhis2/ui-widgets";
import React from "react";
import { D2Api } from "../../../types/d2-api";
import { AppContext } from "../../contexts/app-context";
import Root from "../../pages/root/RootPage";
import Share from "../share/Share";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";
import { getCompositionRoot } from "../../../compositionRoot";
import { appConfig } from "../../../app-config";
import { Config } from "../../../domain/entities/Config";

type D2 = object;

declare global {
    interface Window {
        app: { config: Config };
    }
}

const App = ({ api, d2 }: { api: D2Api; d2: D2 }) => {
    const { baseUrl } = useConfig();

    const [showShareButton, setShowShareButton] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [appContext, setAppContext] = React.useState<AppContext | null>(null);

    React.useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot(api);

            const [d2, config] = await Promise.all([
                init({ baseUrl: baseUrl + "/api", schemas: [] }),
                compositionRoot.config.get.execute(),
            ]);
            const appContext: AppContext = { d2, api, config, compositionRoot };
            window.app = { config };

            setAppContext(appContext);
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            setLoading(false);
        }
        setup();
    }, [d2, api, baseUrl]);

    if (loading) {
        return (
            <div style={{ margin: 20 }}>
                <h3>Connecting to {baseUrl}...</h3>
                <LinearProgress />
            </div>
        );
    }

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <SnackbarProvider>
                    <HeaderBar appName={"Data Management"} />

                    <div id="app" className="content">
                        <AppContext.Provider value={appContext}>
                            <Root />
                        </AppContext.Provider>
                    </div>

                    <Share visible={showShareButton} />
                </SnackbarProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
};

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback?: {
        token: string[];
        createIssue: boolean;
        sendToDhis2UserGroups: string[];
        issues: {
            repository: string;
            title: string;
            body: string;
        };
        snapshots: {
            repository: string;
            branch: string;
        };
        feedbackOptions: object;
    };
}

export default React.memo(App);
