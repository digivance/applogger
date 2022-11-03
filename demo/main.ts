import AppLogger, { LogLevel } from "@digivance/applogger/applogger";
import ConsoleProvider from "@digivance/applogger/providers/ConsoleProvider";
import FileProvider, { FileProviderRotationInterval } from "@digivance/applogger/providers/FileProvider";

/**
 * This is how we create a basic logger to use
 */
const logger = new AppLogger([
    /**
     * Tell it to include a ConsoleProvider (will log to the console)
     */
    new ConsoleProvider({ minLogLevel: LogLevel.trace }),

    /**
     * Tell it to include a FileProvider (will log to files)
     */
    new FileProvider({
        filePath: __dirname,
        minLogLevel: LogLevel.trace,
        rotationInterval: FileProviderRotationInterval.daily
    })
]);

/**
 * Now go ahead and sent the applogger some log stuffs!
*/
logger.logTrace('Yay I\'m a trace message, you probably will never use or see me');

logger.logDebug('I\'m a debug log, maybe you have me in there to troubleshoot a difficult or seemingly random bug');

logger.logInfo(
    'Information time, these normally get included in verbose logging. Might even contain reference information',
    { id: 123, name: 'some user', action: 'did some thing' }
);

logger.shutdown();
