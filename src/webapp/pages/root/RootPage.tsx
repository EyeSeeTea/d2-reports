import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import LandingPage from "../landing/LandingPage";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
