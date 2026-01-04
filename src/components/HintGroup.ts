import { HintItem, HintItemConfig } from './HintItem.js';

export type HintGroupType = 'year' | 'genres' | 'budget' | 'revenue' | 'companies' | 'countries' | 'cast' | 'director';

export interface HintGroupConfig {
    type: HintGroupType;
    items: HintItemConfig[];
    emptyContent?: string;
}

export class HintGroup {
    private config: HintGroupConfig;
    private element: HTMLElement | null = null;
    private items: HintItem[] = [];

    constructor(config: HintGroupConfig) {
        this.config = config;
    }

    render(): HTMLElement {
        const group = document.createElement('div');
        
        // Special handling for inner type (year, budget, revenue)
        if (this.config.items.length > 0 && this.config.items[0].type === 'inner') {
            // For inner type, the item already contains the hint-block wrapper
            const item = new HintItem(this.config.items[0]);
            const itemElement = item.render();
            group.appendChild(itemElement);
            this.items = [item];
        } else {
            if (this.config.items.length === 0) {
                // Create empty state with "?" similar to year block
                group.className = 'hint-block';
                
                const emptyInner = document.createElement('div');
                emptyInner.className = 'hint-inner hint-neutral';
                emptyInner.setAttribute('data-tooltip', this.config.emptyContent || 'Brak danych');
                
                const emptyValue = document.createElement('div');
                emptyValue.className = 'hint-value';
                emptyValue.textContent = '?';
                emptyInner.appendChild(emptyValue);
                
                group.appendChild(emptyInner);
            } else {
                group.className = `hint-block ${this.config.type}-block`;
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

    getElement(): HTMLElement | null {
        return this.element;
    }

    update(config: Partial<HintGroupConfig>): void {
        this.config = { ...this.config, ...config };
        if (this.element) {
            this.element.innerHTML = '';
            this.items = [];

            if (this.config.items.length > 0 && this.config.items[0].type === 'inner') {
                const item = new HintItem(this.config.items[0]);
                const itemElement = item.render();
                this.element.appendChild(itemElement);
                this.items = [item];
            } else {
                if (this.config.items.length === 0) {
                    // Create empty state with "?" similar to year block
                    this.element.className = 'hint-block';
                    this.element.innerHTML = '';
                    
                    const emptyInner = document.createElement('div');
                    emptyInner.className = 'hint-inner hint-neutral';
                    emptyInner.setAttribute('data-tooltip', this.config.emptyContent || 'Brak danych');
                    
                    const emptyValue = document.createElement('div');
                    emptyValue.className = 'hint-value';
                    emptyValue.textContent = '?';
                    emptyInner.appendChild(emptyValue);
                    
                    this.element.appendChild(emptyInner);
                } else {
                    this.element.className = `hint-block ${this.config.type}-block`;
                    this.items = this.config.items.map(itemConfig => {
                        const item = new HintItem(itemConfig);
                        const itemElement = item.render();
                        this.element!.appendChild(itemElement);
                        return item;
                    });
                }
            }
        }
    }
}

