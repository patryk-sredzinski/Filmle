import { HintItemConfig } from '../HintItem.js';
import { YearComparison } from '../../types.js';

export interface YearHintConfig {
    comparison: YearComparison;
}

export class YearHint {
    static create(config: YearHintConfig): HintItemConfig {
        const { comparison } = config;
        
        // If value exists, it's guess mode
        if (comparison.value !== undefined && comparison.value !== null) {
            const year = comparison.value;
            const arrow = comparison.arrow || '?';
            let color: 'green' | 'yellow' | 'red' | 'neutral' = 'neutral';
            let tooltip = `Rok wydania: ${year} ${arrow}`;

            if (arrow === '=') {
                color = 'green';
                tooltip = `Rok wydania: ${year} =\ntajemniczy film ma ten sam rok`;
            } else if (arrow === '↑' || arrow === '↓') {
                color = 'red';
                tooltip = `Rok wydania: ${year} ${arrow}\ntajemniczy film jest ${arrow === '↑' ? 'nowszy' : 'starszy'}`;
            } else {
                color = 'neutral';
                tooltip = `Rok wydania: ${year} ?\nbrak danych`;
            }

            return {
                type: 'inner',
                color,
                value: year.toString(),
                arrow,
                tooltip
            };
        } else {
            // Mystery mode: show min/max range
            const { min, max, isClose } = comparison;
            let color: 'green' | 'yellow' | 'red' | 'neutral' = 'neutral';
            let value = '?';
            let arrow = '';
            let tooltip = 'Rok wydania: ?\nbrak danych';

            if (min !== null && min !== undefined && max !== null && max !== undefined) {
                if (min === max) {
                    value = min.toString();
                    arrow = '=';
                    color = 'green';
                    tooltip = `Rok wydania: ${min} =\ntajemniczy film ma ten sam rok`;
                } else {
                    value = `${min}<br>-<br>${max}`;
                    arrow = '';
                    color = 'red';
                    tooltip = `Rok wydania: ${min}-${max}\ntajemniczy film jest między ${min} a ${max}`;
                }
            } else if (min !== null && min !== undefined) {
                value = min.toString();
                arrow = '↑';
                color = 'red';
                tooltip = `Rok wydania: >${min}\ntajemniczy film jest nowszy niż ${min}`;
            } else if (max !== null && max !== undefined) {
                value = max.toString();
                arrow = '↓';
                color = 'red';
                tooltip = `Rok wydania: <${max}\ntajemniczy film jest starszy niż ${max}`;
            }

            return {
                type: 'inner',
                color,
                value,
                arrow,
                tooltip
            };
        }
    }
}
