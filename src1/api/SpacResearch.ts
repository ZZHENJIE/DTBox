import { MFetch } from '../utils/Tool';
import { type SpacResearchItem, type SpacResearchEvent } from './Type'
async function Calendar() {
    const url = 'https://www.spacresearch.com/calendar';
    const response = await MFetch(url, { method: 'GET' });
    const html = await response.text();
    const parser = new DOMParser();
    const result: SpacResearchItem[] = [];
    const doc = parser.parseFromString(html, 'text/html');

    const calendar = doc.getElementById('calendar');
    if (!calendar) {
        return result
    };

    const days = calendar.querySelectorAll('.days .day');
    const now = new Date();
    const month = now.getMonth() + 1;

    days.forEach(day => {
        if (day.className != 'day other-month ') {
            const dateElement = day.querySelector('.date');
            if (!dateElement) {
                return
            };

            const date = dateElement.textContent?.trim();

            const eventElements = day.querySelectorAll('.event');

            eventElements.forEach(eventElement => {
                const eventType = Array.from(eventElement.classList)
                    .find(className => className !== 'event');

                const link = eventElement.querySelector('a');
                if (!link) return;

                const href = link.getAttribute('href');

                result.push({
                    Date: month + '-' + date,
                    Event: eventType as SpacResearchEvent,
                    Symbol: href?.split('/').pop() || ''
                });
            });
        }
    });

    return result;
}

export default {
    Calendar
}