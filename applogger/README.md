# Digivance AppLogger
This is a simple logging solution for NodeJS.

To install:

```
npm i --save @digivance/applogger
```

Basic usage:
```
import AppLogger from '@digivance/applogger';
import { ConsoleProvider } from '@digivance/applogger/providers';

const logger = new AppLogger([
    /**
     * Default console provider
     */
    new ConsoleProvider(),

    /**
     * File provider with daily rotation, saves in this scripts path
     */
    new FileProvider({
        filePath: __dirname,
        rotationInterval: FileProviderRotationInterval.daily
    })
]);

/**
 * use log functions
*/
logger.logInfo('Simple logging');

/**
 * Optionall provide an extra object that will be logged as JSON
*/
logger.logError('Pretend I\'m an error', { message: 'Something broke' });

/**
 * Call this when you are done with the logger to flush out remaining
 * logs and stop the flush timer
*/
logger.shutdown();
```
