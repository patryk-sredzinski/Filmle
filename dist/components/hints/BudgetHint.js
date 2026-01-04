import { formatCurrencyShort } from '../../utils.js';
export class BudgetHint {
    static createForGuess(config) {
        const { budget, comparison } = config;
        const budgetValue = formatCurrencyShort(budget || 0);
        if (!comparison) {
            return {
                type: 'budget',
                items: [{
                        type: 'inner',
                        color: 'neutral',
                        icon: '💰',
                        value: budgetValue,
                        arrow: '?',
                        tooltip: `Budżet: ${budgetValue} ?\nbrak danych`
                    }]
            };
        }
        let color = 'neutral';
        let arrow = '';
        let tooltip = '';
        if (comparison.result === 'unknown') {
            color = 'neutral';
            arrow = '?';
            tooltip = `Budżet: ${budgetValue} ?\nbrak danych`;
        }
        else if (comparison.result === 'match') {
            color = 'green';
            arrow = '=';
            tooltip = `Budżet: ${budgetValue} =\ntajemniczy film ma ten sam budżet`;
        }
        else if (comparison.result === 'much_higher') {
            color = 'red';
            arrow = '↓↓';
            tooltip = `Budżet: ${budgetValue} ↓↓\ntajemniczy film ma dużo mniejszy budżet`;
        }
        else if (comparison.result === 'higher') {
            color = 'yellow';
            arrow = '↓';
            tooltip = `Budżet: ${budgetValue} ↓\ntajemniczy film ma mniejszy budżet`;
        }
        else if (comparison.result === 'lower') {
            color = 'yellow';
            arrow = '↑';
            tooltip = `Budżet: ${budgetValue} ↑\ntajemniczy film ma większy budżet`;
        }
        else if (comparison.result === 'much_lower') {
            color = 'red';
            arrow = '↑↑';
            tooltip = `Budżet: ${budgetValue} ↑↑\ntajemniczy film ma dużo większy budżet`;
        }
        return {
            type: 'budget',
            items: [{
                    type: 'inner',
                    color,
                    icon: '💰',
                    value: budgetValue,
                    arrow,
                    tooltip
                }]
        };
    }
    static createForMystery(config) {
        const { minBudget, maxBudget } = config;
        let color = 'neutral';
        let value = '?';
        let arrow = '';
        let tooltip = 'Budżet: ?\nbrak danych';
        if (minBudget !== null && minBudget !== undefined && maxBudget !== null && maxBudget !== undefined) {
            if (Math.abs(minBudget - maxBudget) / Math.max(minBudget, maxBudget) < 0.1) {
                value = formatCurrencyShort(minBudget);
                arrow = '=';
                color = 'green';
                tooltip = `Budżet: ${formatCurrencyShort(minBudget)} =\ntajemniczy film ma ten sam budżet`;
            }
            else {
                value = `${formatCurrencyShort(minBudget)}<br>-<br>${formatCurrencyShort(maxBudget)}`;
                arrow = '';
                color = 'yellow';
                tooltip = `Budżet: ${formatCurrencyShort(minBudget)} - ${formatCurrencyShort(maxBudget)}\ntajemniczy film ma budżet między ${formatCurrencyShort(minBudget)} a ${formatCurrencyShort(maxBudget)}`;
            }
        }
        else if (minBudget !== null && minBudget !== undefined) {
            value = formatCurrencyShort(minBudget);
            arrow = '↑';
            color = 'yellow';
            tooltip = `Budżet: >${formatCurrencyShort(minBudget)}\ntajemniczy film ma większy budżet niż ${formatCurrencyShort(minBudget)}`;
        }
        else if (maxBudget !== null && maxBudget !== undefined) {
            value = formatCurrencyShort(maxBudget);
            arrow = '↓';
            color = 'yellow';
            tooltip = `Budżet: <${formatCurrencyShort(maxBudget)}\ntajemniczy film ma mniejszy budżet niż ${formatCurrencyShort(maxBudget)}`;
        }
        return {
            type: 'budget',
            items: [{
                    type: 'inner',
                    color,
                    icon: '💰',
                    value,
                    arrow,
                    tooltip
                }]
        };
    }
}
//# sourceMappingURL=BudgetHint.js.map