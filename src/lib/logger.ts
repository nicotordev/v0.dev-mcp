import chalk from "chalk";
import { format } from "date-fns";

export const logger = {
  info: (msg: string, meta?: any) =>
    console.error(
      chalk.blue(`[INFO ${format(new Date(), "HH:mm:ss")}]`),
      msg,
      meta || ""
    ),
  warn: (msg: string, meta?: any) =>
    console.error(
      chalk.yellow(`[WARN ${format(new Date(), "HH:mm:ss")}]`),
      msg,
      meta || ""
    ),
  error: (msg: string, meta?: any) =>
    console.error(
      chalk.red(`[ERROR ${format(new Date(), "HH:mm:ss")}]`),
      msg,
      meta || ""
    ),
  success: (msg: string, meta?: any) =>
    console.error(
      chalk.green(`[SUCCESS ${format(new Date(), "HH:mm:ss")}]`),
      msg,
      meta || ""
    ),
};
