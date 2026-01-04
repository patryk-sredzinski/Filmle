export class YearHint {
    static createForGuess(config) {
        const { year, comparison } = config;
        if (!comparison) {
            return {
                type: 'year',
                items: [{
                        type: 'inner',
                        color: 'neutral',
                        value: year.toString(),
                        arrow: '?',
                        tooltip: `Rok wydania: ${year} ?\nbrak danych`
                    }]
            };
        }
        let color = 'neutral';
        let arrow = '';
        let tooltip = '';
        if (comparison.result === 'unknown') {
            color = 'neutral';
            arrow = '?';
            tooltip = `Rok wydania: ${year} ?\nbrak danych`;
        }
        else if (comparison.result === 'match') {
            color = 'green';
            arrow = '=';
            tooltip = `Rok wydania: ${year} =\ntajemniczy film ma ten sam rok`;
        }
        else if (comparison.result === 'much_newer') {
            color = 'red';
            arrow = '↓↓';
            tooltip = `Rok wydania: ${year} ↓↓\ntajemniczy film jest dużo starszy`;
        }
        else if (comparison.result === 'newer') {
            color = 'yellow';
            arrow = '↓';
            tooltip = `Rok wydania: ${year} ↓\ntajemniczy film jest starszy`;
        }
        else if (comparison.result === 'older') {
            color = 'yellow';
            arrow = '↑';
            tooltip = `Rok wydania: ${year} ↑\ntajemniczy film jest nowszy`;
        }
        else if (comparison.result === 'much_older') {
            color = 'red';
            arrow = '↑↑';
            tooltip = `Rok wydania: ${year} ↑↑\ntajemniczy film jest dużo nowszy`;
        }
        return {
            type: 'year',
            items: [{
                    type: 'inner',
                    color,
                    value: year.toString(),
                    arrow,
                    tooltip
                }]
        };
    }
    static createForMystery(config) {
        const { minYear, maxYear } = config;
        let color = 'neutral';
        let value = '?';
        let arrow = '';
        let tooltip = 'Rok wydania: ?\nbrak danych';
        if (minYear !== null && minYear !== undefined && maxYear !== null && maxYear !== undefined) {
            if (minYear === maxYear) {
                value = minYear.toString();
                arrow = '=';
                color = 'green';
                tooltip = `Rok wydania: ${minYear} =\ntajemniczy film ma ten sam rok`;
            }
            else {
                value = `${minYear}<br>-<br>${maxYear}`;
                arrow = '';
                color = 'yellow';
                tooltip = `Rok wydania: ${minYear}-${maxYear}\ntajemniczy film jest między ${minYear} a ${maxYear}`;
            }
        }
        else if (minYear !== null && minYear !== undefined) {
            value = minYear.toString();
            arrow = '↑';
            color = 'yellow';
            tooltip = `Rok wydania: >${minYear}\ntajemniczy film jest nowszy niż ${minYear}`;
        }
        else if (maxYear !== null && maxYear !== undefined) {
            value = maxYear.toString();
            arrow = '↓';
            color = 'yellow';
            tooltip = `Rok wydania: <${maxYear}\ntajemniczy film jest starszy niż ${maxYear}`;
        }
        return {
            type: 'year',
            items: [{
                    type: 'inner',
                    color,
                    value,
                    arrow,
                    tooltip
                }]
        };
    }
}
//# sourceMappingURL=YearHint.js.map