import moment from 'moment';

const log = (level: string, msg: string) => {
  const formattedMsg = `[${level}] ${msg}`;
  if (level === 'ERROR') {
    console.error(formattedMsg);
  } else {
    console.debug(formattedMsg);
  }
};

const info = (message: string) => {
  log('INFO', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`);
};

const debug = (message: string) => {
  log('DEBUG', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`);
};

const warn = (message: string) => {
  log('WARN', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`);
};

const error = (message: string, err?: any) => {
  if (err) {
    log(
      'ERROR',
      `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}:\n ${err.message}-${err.stack}`
    );
  } else {
    log('ERROR', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`);
  }
};

export default {
  info,
  debug,
  warn,
  error,
};
