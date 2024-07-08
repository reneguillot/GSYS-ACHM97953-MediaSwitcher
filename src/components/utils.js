import { useState } from 'react'

/**
 * logToConsole provides a way for conditional console logging. Any number of parameters can be passed into the function.
 * @param  {...any} args Logging arguments. First parameter is expected to be the (Boolean) CONDITION for logging.
 * Remaining parameters are ARGUMENTS for console logging
 */
export const logToConsole = (...args) => {
    if (args) {
        const condition = args[0];
        const loggingArgs = args.slice(1);

        if (condition) {
            console.log(...loggingArgs);
        }
    }
}