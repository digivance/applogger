import { LogLevel } from "../applogger";
import ILoggingProvider, { BaseLoggingProvider } from "./ILoggingProvider";

/**
 * Options for creating a console provider
 */
export interface ConsoleProviderOptions {
    /**
     * Optional if you want to override the default minimum logging level (Info)
     */
    minLogLevel?: number;

    /**
     * Optional if you want to override the default flushAfterSeconds (1)
     */
    flushAfterSeconds?: number;
}

/**
 * Writes log events to the console 
 */
export default class ConsoleProvider extends BaseLoggingProvider implements ILoggingProvider {
    /**
     * Constructor, allows you to customize basic settings
     * 
     * @param options Optional ConsoleProviderOptions you can provide
     */
    constructor(options?: ConsoleProviderOptions) {
        super();

        if (options) {
            this.minLogLevel = options.minLogLevel ?? this.minLogLevel;
            this.flushAfterSeconds = options.flushAfterSeconds ?? this.flushAfterSeconds;
        }
    }

    /**
     * Call this to immediately flush all my log events
     */
    public async flush() {
        const logs = this.pendingLogs;
        this.pendingLogs = [];

        let msg = '';

        if (logs) {
            logs.forEach(log => {
                msg += log.date;

                switch (log.logLevel) {
                    case LogLevel.trace:
                        msg += ` [TRACE]: `;
                        break;
                    case LogLevel.debug:
                        msg += `\x1b[36m [DEBUG]\x1b[0m: `;
                        break;
                    case LogLevel.info:
                        msg += `\x1b[34m [INFO]\x1b[0m: `;
                        break;
                    case LogLevel.warning:
                        msg += `\x1b[33m [WARNING]\x1b[0m: `;
                        break;
                    case LogLevel.error:
                        msg += `\x1b[31m [ERROR]\x1b[0m: `;
                        break;
                    case LogLevel.critical:
                        msg += `\x1b[35m [CRITICAL]\x1b[0m: `;
                        break;
                }

                msg += `${log.message} \n`;

                if (log.extra)
                    msg += `${JSON.stringify(log.extra)}\n`;
            });

            console.log(msg);
        }
    }
}
