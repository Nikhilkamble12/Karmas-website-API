import chalk from "chalk";

class Logger {
  static log(message) {
    const timestamp = new Date().toLocaleString();
    console.log(chalk.blue(`[${timestamp}] ${message}`));
  }

  static logError(message) {
    const timestamp = new Date().toLocaleString();
    console.log(chalk.red(`[${timestamp}] ${message}`));
  }
}

export default Logger;