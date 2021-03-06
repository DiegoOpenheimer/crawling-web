import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { run } from './services/crawling-web.js';

const readFile = promisify(fs.readFile);

const startDateParams = process.argv.find(arg => arg.startsWith('startDate='));

const { format } = new Intl.DateTimeFormat('pt-br');

const startDate = moment(startDateParams?.split('=')[1] || '2018-01-01').utc();

const nextMonth = moment().add(1, 'month').utc().endOf('month');

async function main() {
    let lastDate = startDate.clone().utc().endOf('month');
    try {
        let data;
        const rawData = await readFile(path.join(new URL('.', import.meta.url).pathname, 'data.json')).catch(_=>null);
        if (rawData) {
            data = JSON.parse(rawData.toString());
            const lastInfo = data[data.length - 1];
            lastDate = moment(lastInfo.period).clone().add(1, 'month').utc().endOf('month');
        }
        const initialPeriod = format(startDate?.toDate());
        const finalPeriod = format(lastDate?.toDate());
        if (lastDate.isSame(nextMonth)) {
            return false;
        }
        await run(initialPeriod, finalPeriod, data);
        main();
    } catch (error) {
        console.log(error);
    }
};

main();