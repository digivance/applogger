import * as fsa from 'fs/promises';
import path from 'path';
import { LogLevel } from "../applogger";
import ILoggingProvider, { BaseLoggingProvider } from "./ILoggingProvider";

/**
 * Serves as an enum of the values for FileProviderOptions.rotationInterval
 */
export const FileProviderRotationInterval = {
    /**
     * No log rotation, one big ole file, bad idea but is the default for least
     * black box magic
     */
    none: 0,

    /**
     * Rotate logs daily
     */
    daily: 1,

    /**
     * Rotate logs monthly
     */
    monthly: 2,

    /**
     * Rotate logs yearly
     */
    yearly: 3
};

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

    /**
     * Optional FileProviderRotationInterval
     */
    rotationInterval?: number;
}

/**
 * Writes log events to the console 
 */
export default class FileProvider extends BaseLoggingProvider implements ILoggingProvider {
    /**
     * Extension of the log file we will write to
     */
    public fileExtension: string;

    /**
     * First part of the log file name that we write to
     */
    public fileName: string;

    /**
     * Path where we write log files
     */
    public filePath: string;

    /**
     * FileProviderRotationInterval
     * 
     * Interval at which we rotate logs (e.g. rename and start new file)
     */
    public rotationInterval: number;

    /**
     * Constructor, allows you to customize basic settings
     * 
     * @param options Optional FileProviderOptions you can provide
     */
    constructor(options?: FileProviderOptions) {
        super();

        // File Provider defaults
        this.setFilename('applogger.log');
        this.filePath = '';
        this.rotationInterval = FileProviderRotationInterval.none;

        // Override them all if provided
        if (options) {
            this.minLogLevel = options.minLogLevel ?? this.minLogLevel;
            this.flushAfterSeconds = options.flushAfterSeconds ?? this.flushAfterSeconds;

            this.fileName = options.fileName ?? this.fileName;
            this.filePath = options.filePath ?? this.filePath;
            this.rotationInterval = options.rotationInterval ?? this.rotationInterval;
        }
    }

    /**
     * Constructs the filename based on current settings
     * 
     * @returns filename to append messages to
     */
    public getFilename(): string {
        const day = `${this.fileName && this.fileName.length > 0 ? '_' : ''}${(new Date()).toISOString().split('T')[0]}`;

        switch (this.rotationInterval) {
            case FileProviderRotationInterval.daily:
                return path.join(this.filePath, `${this.fileName}${day}.${this.fileExtension}`);
            
            case FileProviderRotationInterval.monthly:
                return path.join(this.filePath, `${this.fileName}${day.substring(0, 7)}.${this.fileExtension}`);

            case FileProviderRotationInterval.yearly:
                return path.join(this.filePath, `${this.fileName}${day.substring(0, 4)}.${this.fileExtension}`);

            case FileProviderRotationInterval.none:
            default:
                return path.join(this.filePath, `${this.fileName}.${this.fileExtension}`);
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
            const filename = this.getFilename();
            await fsa.appendFile(filename, logMessage);
        }
    }

    /**
     * Used to properly parse a filename into class settings
     * 
     * @param filename The filenam to parse into this.fileExtension and this.fileName
     */
    public setFilename(filename: string) {
        const lastDotPos = filename.lastIndexOf('.');

        if (lastDotPos === 0) {
            this.fileExtension = filename.substring(1, filename.length);
            this.fileName = '';
        } else if (lastDotPos > 0) {
            this.fileExtension = filename.substring(lastDotPos + 1, filename.length);
            this.fileName = filename.substring(0, lastDotPos);
        } else {
            this.fileExtension = 'log';
            this.fileName = filename;
        }
    }
}
