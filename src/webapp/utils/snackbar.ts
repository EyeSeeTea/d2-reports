import React from "react";
import _ from "lodash";
import { useSnackbar } from "d2-ui-components";

export function useSnackbarOnError<T>(fn: (...args: any[]) => Promise<T>) {
    const snackbar = useSnackbar();

    return React.useCallback(
        async (...args: any[]) => {
            try {
                return await fn(...args);
            } catch (err) {
                const bodyMessage = err.response?.data?.message;
                console.error(err);
                const message = _([err.message || err?.toString(), bodyMessage])
                    .compact()
                    .join(" - ");
                snackbar.error(message);
                return undefined;
            }
        },
        [fn, snackbar]
    );
}
