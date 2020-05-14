import moment from 'moment';

const log = (tag: string = null, level: string, msg: string, others: any = '') => {
	const formattedMsg = `[${level}][${tag || ''}] ${msg}`;
	if (level === 'ERROR') {
		console.error(formattedMsg, others);
	} else if (level === 'WARN') {
		console.warn(formattedMsg, others);
	} else {
		console.info(formattedMsg, others);
	}
};

const info = (tag: string = null, message: string, others?: any) => {
	log(tag, 'INFO', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`, others);
};

const debug = (tag: string = null, message: string, others?: any) => {
	log(tag, 'DEBUG', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`, others);
};

const warn = (tag: string = null, message: string, others?: any) => {
	log(tag, 'WARN', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`, others);
};

const error = (tag: string = null, message: string, err?: any, others?: any) => {
	if (err) {
		log(
			tag,
			'ERROR',
			`[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}:\n ${err.message}-${err.stack}`,
			others
		);
	} else {
		log(tag, 'ERROR', `[${moment().format('YYYY-MM-DD HH:mm:ss')}] => ${message}`, others);
	}
};

export default {
	info,
	debug,
	warn,
	error
};
