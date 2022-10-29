import * as fsa from 'fs/promises';
import path from 'path';
import { LogLevel } from "../applogger";
import ILoggingProvider, { BaseLoggingProvider } from "./ILoggingProvider";

/**
 * Options for creating a file provider
 */
export interface FileProviderOptions {
    /**
     * Optional if you want to override the default minimum logging level (Info)
     */
    minLogLevel?: number;

    /**
     * Optional path to write files to
     */
    filePath?: string,

    /**
     * Optional name of the files to write
     */
    fileName?: string,

    /**
     * Optional if you want to override the default flushAfterSeconds (1)
     */
    flushAfterSeconds?: number;
}

/**
 * Writes log events to the console 
 */
export default class FileProvider extends BaseLoggingProvider implements ILoggingProvider {
    public filePath: string;
    public fileName: string;

    /**
     * Constructor, allows you to customize basic settings
     * 
     * @param options Optional FileProviderOptions you can provide
     */
    constructor(options?: FileProviderOptions) {
        super();

        // File Provider defaults
        this.filePath = __dirname;
        this.fileName = 'log.txt';

        // Override them all if provided
        if (options) {
            if (options.minLogLevel) this.minLogLevel = options.minLogLevel;
            if (options.flushAfterSeconds) this.flushAfterSeconds = options.flushAfterSeconds;
            if (options.filePath) this.filePath = options.filePath;
            if (options.fileName) this.fileName = options.fileName;
        } 
    }

    /**
     * Call this to immediately flush all my log events
     */
    public async flush() {
        const logs = this.pendingLogs;
        this.pendingLogs = [];

        let logMessage = ''

        if (logs) {
            logs.forEach(async log => {
                logMessage += `${log.date} [${LogLevel[log.logLevel]}]: ${log.message}\n`;
                if (log.extra) {
                    logMessage += `${JSON.stringify(log.extra)}\n`;
                }
            });
        }

        if (logMessage && logMessage.length > 0) {
            const filename = path.join(this.filePath, this.fileName);
            await fsa.appendFile(filename, logMessage);
        }
    }
}
