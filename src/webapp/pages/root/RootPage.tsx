import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { DataValuesList } from "../../components/data-values-list/DataValuesList";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route render={() => <DataValuesList />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
