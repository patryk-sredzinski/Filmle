import { HintItemConfig } from '../HintItem.js';
import { RevenueComparison } from '../../types.js';
import { formatCurrencyShort } from '../../utils.js';

export interface RevenueHintConfig {
    comparison: RevenueComparison;
}

export class RevenueHint {
    static create(config: RevenueHintConfig): HintItemConfig {
        const { comparison } = config;
        
        // If value exists, it's guess mode
        if (comparison.value !== undefined && comparison.value !== null && comparison.value !== 0) {
            const revenue = comparison.value;
            const revenueValue = formatCurrencyShort(revenue);
            const arrow = comparison.arrow || '?';
            let color: 'green' | 'yellow' | 'red' | 'neutral' = 'neutral';
            let tooltip = `Box Office: ${revenueValue} ${arrow}`;

            if (arrow === '=') {
                color = 'green';
                tooltip = `Box Office: ${revenueValue} =\ntajemniczy film ma ten sam przychód`;
            } else if (arrow === '↑' || arrow === '↓') {
                color = 'red';
                tooltip = `Box Office: ${revenueValue} ${arrow}\ntajemniczy film ma ${arrow === '↑' ? 'większy' : 'mniejszy'} przychód`;
            } else {
                color = 'neutral';
                tooltip = `Box Office: ${revenueValue} ?\nbrak danych`;
            }

            return {
                type: 'inner',
                color,
                icon: '💵',
                value: revenueValue,
                arrow,
                tooltip
            };
        } else {
            // Mystery mode: show min/max range
            const { min, max, isClose } = comparison;
            let color: 'green' | 'yellow' | 'red' | 'neutral' = 'neutral';
            let value = '?';
            let arrow = '';
            let tooltip = 'Box Office: ?\nbrak danych';

            if (min !== null && min !== undefined && max !== null && max !== undefined) {
                if (Math.abs(min - max) / Math.max(min, max) < 0.1 || isClose) {
                    value = formatCurrencyShort(min);
                    arrow = '=';
                    color = 'green';
                    tooltip = `Box Office: ${formatCurrencyShort(min)} =\ntajemniczy film ma ten sam przychód`;
                } else {
                    value = `${formatCurrencyShort(min)}<br>-<br>${formatCurrencyShort(max)}`;
                    arrow = '';
                    color = 'red';
                    tooltip = `Box Office: ${formatCurrencyShort(min)} - ${formatCurrencyShort(max)}\ntajemniczy film ma przychód między ${formatCurrencyShort(min)} a ${formatCurrencyShort(max)}`;
                }
            } else if (min !== null && min !== undefined) {
                value = formatCurrencyShort(min);
                arrow = '↑';
                color = 'red';
                tooltip = `Box Office: >${formatCurrencyShort(min)}\ntajemniczy film ma większy przychód niż ${formatCurrencyShort(min)}`;
            } else if (max !== null && max !== undefined) {
                value = formatCurrencyShort(max);
                arrow = '↓';
                color = 'red';
                tooltip = `Box Office: <${formatCurrencyShort(max)}\ntajemniczy film ma mniejszy przychód niż ${formatCurrencyShort(max)}`;
            }

            return {
                type: 'inner',
                color,
                icon: '💵',
                value,
                arrow,
                tooltip
            };
        }
    }
}
