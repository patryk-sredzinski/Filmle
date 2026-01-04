import { HintItem } from './HintItem.js';
export class HintGroup {
    constructor(config) {
        this.element = null;
        this.items = [];
        this.config = config;
    }
    render() {
        const group = document.createElement('div');
        // Special handling for inner type (year, budget, revenue)
        if (this.config.items.length > 0 && this.config.items[0].type === 'inner') {
            // For inner type, the item already contains the hint-block wrapper
            const item = new HintItem(this.config.items[0]);
            const itemElement = item.render();
            group.appendChild(itemElement);
            this.items = [item];
        }
        else {
            group.className = `hint-block ${this.config.type}-block`;
            if (this.config.items.length === 0) {
                const empty = document.createElement('span');
                empty.className = 'hint-neutral';
                empty.style.padding = '5px';
                empty.textContent = this.config.emptyContent || '-';
                group.appendChild(empty);
            }
            else {
                this.items = this.config.items.map(itemConfig => {
                    const item = new HintItem(itemConfig);
                    const itemElement = item.render();
                    group.appendChild(itemElement);
                    return item;
                });
            }
        }
        this.element = group;
        return group;
    }
    getElement() {
        return this.element;
    }
    update(config) {
        this.config = { ...this.config, ...config };
        if (this.element) {
            this.element.innerHTML = '';
            this.items = [];
            if (this.config.items.length > 0 && this.config.items[0].type === 'inner') {
                const item = new HintItem(this.config.items[0]);
                const itemElement = item.render();
                this.element.appendChild(itemElement);
                this.items = [item];
            }
            else {
                if (this.config.items.length === 0) {
                    const empty = document.createElement('span');
                    empty.className = 'hint-neutral';
                    empty.style.padding = '5px';
                    empty.textContent = this.config.emptyContent || '-';
                    this.element.appendChild(empty);
                }
                else {
                    this.items = this.config.items.map(itemConfig => {
                        const item = new HintItem(itemConfig);
                        const itemElement = item.render();
                        this.element.appendChild(itemElement);
                        return item;
                    });
                }
            }
        }
    }
}
//# sourceMappingURL=HintGroup.js.map