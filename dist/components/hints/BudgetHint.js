import { formatCurrencyShort } from '../../utils.js';
export class BudgetHint {
    static create(config) {
        const { comparison } = config;
        // If value exists, it's guess mode
        if (comparison.value !== undefined && comparison.value !== null && comparison.value !== 0) {
            const budget = comparison.value;
            const budgetValue = formatCurrencyShort(budget);
            const arrow = comparison.arrow || '?';
            let color = 'neutral';
            let tooltip = `Budżet: ${budgetValue} ${arrow}`;
            if (arrow === '=') {
                color = 'green';
                tooltip = `Budżet: ${budgetValue} =\ntajemniczy film ma ten sam budżet`;
            }
            else if (arrow === '↑' || arrow === '↓') {
                color = 'yellow';
                tooltip = `Budżet: ${budgetValue} ${arrow}\ntajemniczy film ma ${arrow === '↑' ? 'większy' : 'mniejszy'} budżet`;
            }
            else if (arrow === '↑↑' || arrow === '↓↓') {
                color = 'red';
                tooltip = `Budżet: ${budgetValue} ${arrow}\ntajemniczy film ma ${arrow === '↑↑' ? 'dużo większy' : 'dużo mniejszy'} budżet`;
            }
            else {
                color = 'neutral';
                tooltip = `Budżet: ${budgetValue} ?\nbrak danych`;
            }
            return {
                type: 'inner',
                color,
                icon: '💰',
                value: budgetValue,
                arrow,
                tooltip
            };
        }
        else {
            // Mystery mode: show min/max range
            const { min, max, isClose } = comparison;
            let color = 'neutral';
            let value = '?';
            let arrow = '';
            let tooltip = 'Budżet: ?\nbrak danych';
            if (min !== null && min !== undefined && max !== null && max !== undefined) {
                if (Math.abs(min - max) / Math.max(min, max) < 0.1 || isClose) {
                    value = formatCurrencyShort(min);
                    arrow = '=';
                    color = 'green';
                    tooltip = `Budżet: ${formatCurrencyShort(min)} =\ntajemniczy film ma ten sam budżet`;
                }
                else {
                    value = `${formatCurrencyShort(min)}<br>-<br>${formatCurrencyShort(max)}`;
                    arrow = '';
                    color = 'yellow';
                    tooltip = `Budżet: ${formatCurrencyShort(min)} - ${formatCurrencyShort(max)}\ntajemniczy film ma budżet między ${formatCurrencyShort(min)} a ${formatCurrencyShort(max)}`;
                }
            }
            else if (min !== null && min !== undefined) {
                value = formatCurrencyShort(min);
                arrow = '↑';
                color = 'yellow';
                tooltip = `Budżet: >${formatCurrencyShort(min)}\ntajemniczy film ma większy budżet niż ${formatCurrencyShort(min)}`;
            }
            else if (max !== null && max !== undefined) {
                value = formatCurrencyShort(max);
                arrow = '↓';
                color = 'yellow';
                tooltip = `Budżet: <${formatCurrencyShort(max)}\ntajemniczy film ma mniejszy budżet niż ${formatCurrencyShort(max)}`;
            }
            return {
                type: 'inner',
                color,
                icon: '💰',
                value,
                arrow,
                tooltip
            };
        }
    }
}
//# sourceMappingURL=BudgetHint.js.map