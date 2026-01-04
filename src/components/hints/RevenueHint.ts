import { HintGroupConfig } from '../HintGroup.js';
import { BudgetComparison } from '../../types.js';
import { formatCurrencyShort } from '../../utils.js';

export interface RevenueHintConfig {
    revenue: number;
    comparison?: BudgetComparison;
    // For mystery info
    minRevenue?: number | null;
    maxRevenue?: number | null;
}

export class RevenueHint {
    static createForGuess(config: RevenueHintConfig): HintGroupConfig {
        const { revenue, comparison } = config;
        const revenueValue = formatCurrencyShort(revenue || 0);

        if (!comparison) {
            return {
                type: 'revenue',
                items: [{
                    type: 'inner',
                    color: 'neutral',
                    icon: '💵',
                    value: revenueValue,
                    arrow: '?',
                    tooltip: `Box Office: ${revenueValue} ?\nbrak danych`
                }]
            };
        }

        let color: 'green' | 'yellow' | 'red' | 'neutral' = 'neutral';
        let arrow = '';
        let tooltip = '';

        if (comparison.result === 'unknown') {
            color = 'neutral';
            arrow = '?';
            tooltip = `Box Office: ${revenueValue} ?\nbrak danych`;
        } else if (comparison.result === 'match') {
            color = 'green';
            arrow = '=';
            tooltip = `Box Office: ${revenueValue} =\ntajemniczy film ma ten sam przychód`;
        } else if (comparison.result === 'much_higher') {
            color = 'red';
            arrow = '↓↓';
            tooltip = `Box Office: ${revenueValue} ↓↓\ntajemniczy film ma dużo mniejszy przychód`;
        } else if (comparison.result === 'higher') {
            color = 'yellow';
            arrow = '↓';
            tooltip = `Box Office: ${revenueValue} ↓\ntajemniczy film ma mniejszy przychód`;
        } else if (comparison.result === 'lower') {
            color = 'yellow';
            arrow = '↑';
            tooltip = `Box Office: ${revenueValue} ↑\ntajemniczy film ma większy przychód`;
        } else if (comparison.result === 'much_lower') {
            color = 'red';
            arrow = '↑↑';
            tooltip = `Box Office: ${revenueValue} ↑↑\ntajemniczy film ma dużo większy przychód`;
        }

        return {
            type: 'revenue',
            items: [{
                type: 'inner',
                color,
                icon: '💵',
                value: revenueValue,
                arrow,
                tooltip
            }]
        };
    }

    static createForMystery(config: RevenueHintConfig): HintGroupConfig {
        const { minRevenue, maxRevenue } = config;

        let color: 'green' | 'yellow' | 'red' | 'neutral' = 'neutral';
        let value = '?';
        let arrow = '';
        let tooltip = 'Box Office: ?\nbrak danych';

        if (minRevenue !== null && minRevenue !== undefined && maxRevenue !== null && maxRevenue !== undefined) {
            if (Math.abs(minRevenue - maxRevenue) / Math.max(minRevenue, maxRevenue) < 0.1) {
                value = formatCurrencyShort(minRevenue);
                arrow = '=';
                color = 'green';
                tooltip = `Box Office: ${formatCurrencyShort(minRevenue)} =\ntajemniczy film ma ten sam przychód`;
            } else {
                value = `${formatCurrencyShort(minRevenue)}<br>-<br>${formatCurrencyShort(maxRevenue)}`;
                arrow = '';
                color = 'yellow';
                tooltip = `Box Office: ${formatCurrencyShort(minRevenue)} - ${formatCurrencyShort(maxRevenue)}\ntajemniczy film ma przychód między ${formatCurrencyShort(minRevenue)} a ${formatCurrencyShort(maxRevenue)}`;
            }
        } else if (minRevenue !== null && minRevenue !== undefined) {
            value = formatCurrencyShort(minRevenue);
            arrow = '↑';
            color = 'yellow';
            tooltip = `Box Office: >${formatCurrencyShort(minRevenue)}\ntajemniczy film ma większy przychód niż ${formatCurrencyShort(minRevenue)}`;
        } else if (maxRevenue !== null && maxRevenue !== undefined) {
            value = formatCurrencyShort(maxRevenue);
            arrow = '↓';
            color = 'yellow';
            tooltip = `Box Office: <${formatCurrencyShort(maxRevenue)}\ntajemniczy film ma mniejszy przychód niż ${formatCurrencyShort(maxRevenue)}`;
        }

        return {
            type: 'revenue',
            items: [{
                type: 'inner',
                color,
                icon: '💵',
                value,
                arrow,
                tooltip
            }]
        };
    }
}

