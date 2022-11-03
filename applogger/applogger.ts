import ILoggingProvider from "./providers/ILoggingProvider";

/**
 * Your basic log levels
 */
export const LogLevel = {
    /**
     * Probably always ignored
     */
    trace: 0,

    /**
     * Stuff that is only helpful when troubleshooting
     */
    debug: 1,

    /**
     * Stuff that is good to know but not necessary
     */
    info: 2,

    /**
     * Something broke but we think it's ok
     */
    warning: 3,

    /**
     * Something is wrong
     */
    error: 4,

    /**
     * Oh no I can't go on
     */
    critical: 5,

    "0": "Trace",
    "1": "Debug",
    "2": "Info",
    "3": "Warning",
    "4": "Error",
    "5": "Critical"
}

/**
 * Basic log event
 */
export interface LogEvent {
    /**
     * Date and time when this log event happened
     */
    date: Date;

    /**
     * LogLevel of this log event
     */
    logLevel: number;

    /**
     * The log message
     */
    message: string;

    /**
     * Optional extra stuff that relates to this log
     */
    extra?: any;
}

/**
 * This is the applogger thing to use
 */
class AppLogger {
    /**
     * The id of the interval timer doing our log flushing
     */
    private flusherId: NodeJS.Timer;

    /**
     * The loggers currently registered
     */
    private loggers: ILoggingProvider[];

    /**
     * Construct with the provided logging providers
     * 
     * @param loggers Array of ILoggingProviders you want to use
     */
    constructor(loggers?: ILoggingProvider[]) {
        this.addLogger.bind(this);
        this.flushLogs.bind(this);
        this.log.bind(this);
        this.logTrace.bind(this);
        this.logDebug.bind(this);
        this.logInfo.bind(this);
        this.logWarning.bind(this);
        this.logError.bind(this);
        this.logCritical.bind(this);

        this.loggers = loggers;
        this.flusherId = setInterval(() => this.flushLogs(), 1000);
    }

    /**
     * Add another logging provider, maybe you use this in conditional statements?
     * 
     * @param logger The logging provider to add (Careful, no duplicate warning)
     */
    public addLogger(logger: ILoggingProvider) {
        this.loggers = [
            ...this.loggers,
            logger
        ];
    }

    /**
     * Called from our interval timer, this will trigger all the registered providers
     * to flush their current pendingLog if flushAfterSeconds of the provider have
     * elapsed since the providers lastFlush. Resets the providers lastFlush to now
     * when logs have been flushed.
     */
    public flushLogs() {
        if (this.loggers) {
            this.loggers.forEach(async logger => {
                const timeToRun = new Date(logger.lastFlush.getTime() + (logger.flushAfterSeconds * 1000));

                if (timeToRun <= new Date()) {
                    await logger.flush();
                    logger.lastFlush = new Date();
                }
            });
        }
    }

    /**
     * Used when shutting down or anytime you want to force flush all the loggers
     */
    public flushLogsNow() {
        if (this.loggers) {
            this.loggers.forEach(async logger => {
                await logger.flush();
                logger.lastFlush = new Date();
            });
        }
    }

    /**
     * Adds a pendingLog to all registered loggers
     * 
     * @param logLevel level of the log message
     * @param message the message to log
     * @param extra optional extra related data
     */
    public log(logLevel: number, message: string, extra?: any) {
        if (this.loggers) {
            this.loggers.forEach(logger => {
                logger.log(logLevel, message, extra);
            });
        }
    }

    /**
     * Adds a trace pendingLog to all registered loggers
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logTrace(message: string, extra?: any) { this.log(LogLevel.trace, message, extra); }

    /**
     * Adds a debug pendingLog to all registered loggers
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logDebug(message: string, extra?: any) { this.log(LogLevel.debug, message, extra); }

    /**
     * Adds a info pendingLog to all registered loggers
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logInfo(message: string, extra?: any) { this.log(LogLevel.info, message, extra); }

    /**
     * Adds a warning pendingLog to all registered loggers
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logWarning(message: string, extra?: any) { this.log(LogLevel.warning, message, extra); }

    /**
     * Adds a error pendingLog to all registered loggers
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logError(message: string, extra?: any) { this.log(LogLevel.error, message, extra); }

    /**
     * Adds a critical pendingLog to all registered loggers
     * 
     * @param message the message to log
     * @param extra optional extra related data
     */
    public logCritical(message: string, extra?: any) { this.log(LogLevel.critical, message, extra); }

    /**
     * Call this to force flush any remaining logs and stop the flusher timer
     */
    public shutdown() {
        this.flushLogsNow();
        clearInterval(this.flusherId);
    }
}

export default AppLogger;
