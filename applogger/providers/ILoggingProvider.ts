import { LogEvent, LogLevel } from '../applogger'

export default interface ILoggingProvider {
    /**
     * Adds a pendingLog
     * 
     * @param logLevel level of the log message
     * @param message the message to log
     * @param extra optional extra related data
     */
    log: (logLevel: number, message: string, extra?: any) => void;

    /**
     * Adds a trace pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    logTrace: (message: string, extra?: any) => void;

    /**
     * Adds a debug pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    logDebug: (message: string, extra?: any) => void;

    /**
     * Adds a info pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    logInfo: (message: string, extra?: any) => void;

    /**
     * Adds a warning pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    logWarning: (message: string, extra?: any) => void;

    /**
     * Adds a error pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    logError: (message: string, extra?: any) => void;

    /**
     * Adds a critical pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    logCritical: (message: string, extra?: any) => void;

    /**
     * This is what the provider implements to persist log events somewhere
     */
    flush: () => Promise<void>;

    /**
     * How many seconds between flushes
     */
    flushAfterSeconds: number;

    /**
     * Date and time when logs were last flushed
     */
    lastFlush: Date;
}

/**
 * Implements some shared logic for a ILoggingProvider (not an actual provider)
 */
export class BaseLoggingProvider {
    /**
     * How many seconds between flushes
     */
    public flushAfterSeconds: number;

    /**
     * Date and time when logs were last flushed
     */
    public lastFlush: Date;

    /**
     * The minimum LogLevel we will receive and persist (per provider)
     */
    public minLogLevel: number;

    /**
     * The penging log events (per provider)
     */
    public pendingLogs: LogEvent[];

    /**
     * Constructor, sets default values
     */
    constructor() {
        this.flushAfterSeconds = 1;
        this.lastFlush = new Date();
        this.minLogLevel = LogLevel.info;
        this.pendingLogs = [];
    }

    /**
     * Adds a pendingLog
     * 
     * @param logLevel level of the log message
     * @param message the message to log
     * @param extra optional extra related data
     */
    public log(logLevel: number, message: string, extra?: any) {
        if (logLevel >= this.minLogLevel) {
            this.pendingLogs = [
                ...this.pendingLogs,
                {
                    date: new Date(),
                    logLevel,
                    message,
                    extra
                }
            ]
        }
    }

    /**
     * Adds a trace pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logTrace(message: string, extra?: any) { this.log(LogLevel.trace, message, extra); }

    /**
     * Adds a debug pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logDebug(message: string, extra?: any) { this.log(LogLevel.debug, message, extra); }

    /**
     * Adds a info pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logInfo(message: string, extra?: any) { this.log(LogLevel.info, message, extra); }

    /**
     * Adds a warning pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logWarning(message: string, extra?: any) { this.log(LogLevel.warning, message, extra); }

    /**
     * Adds a error pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logError(message: string, extra?: any) { this.log(LogLevel.error, message, extra); }

    /**
     * Adds a critical pendingLog
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logCritical(message: string, extra?: any) { this.log(LogLevel.critical, message, extra); }
}
