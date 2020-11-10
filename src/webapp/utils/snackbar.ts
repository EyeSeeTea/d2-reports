import React from "react";
import _ from "lodash";
import { useSnackbar } from "d2-ui-components";

export function useSnackbarOnError<T, Args extends any[]>(fn: (...args: Args) => Promise<T>) {
    const snackbar = useSnackbar();

    return React.useCallback(
        async (...args: Args) => {
            try {
                return await fn(...args);
            } catch (err) {
                console.error(err);
                const bodyMessage = err.response?.data?.message;
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
