// dateConverter.js
import { parse, format, isValid } from 'date-fns';

export function convertDateFormatToDb(dateString) {

    if (!dateString || dateString.trim() === '') {
        return "0000-00-00";
    }

    const formats = [
        'dd-MM-yyyy',
        'dd/MM/yyyy',
        'dd:MM:yyyy',
        'yyyy-MM-dd',
        'MM/dd/yyyy', // MM/DD/YYYY format
        'MMMM dd, yyyy', // e.g., December 15, 1983
        'yyyy.MM.dd', // e.g., 1983.12.15
        'yyyy/MM/dd' // Added YYYY/MM/DD format
    ];

    for (const formatString of formats) {
        const parsedDate = parse(dateString, formatString, new Date());
        if (isValid(parsedDate)) {
            return format(parsedDate, 'yyyy-MM-dd');
        }
    }

    return dateString;
}

