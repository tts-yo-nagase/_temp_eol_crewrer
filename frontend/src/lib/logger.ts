
import { createConsola } from "consola";

const isProduction = process.env.NODE_ENV === "production";
/**
  Log Levels
  0: Fatal and Error
  1: Warnings
  2: Normal logs
  3: Informational logs, success, fail, ready, start, ...
  4: Debug logs
  5: Trace logs
  -999: Silent
  +999: Verbose logs
  */
const logger = isProduction ? createConsola({
  // if env is development, then use the console reporter
  reporters: [
    {
      log: (logObj) => {
        console.log(JSON.stringify(logObj));
      },
    },
  ],
  level: 3,
  formatOptions: {
    columns: 60,
    colors: true,
    compact: false,
    date: true,
  },
}) : createConsola({
  // if env is development, then use the console reporter
  level: 5,
  // fancy: true,
  formatOptions: {
    columns: 60,
    colors: true,
    compact: false,
    date: true,
  },
});

export default logger;
