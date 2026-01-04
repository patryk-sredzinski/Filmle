import { Hint, HintType, HintState } from '../hints.js';

export interface HintsMenuConfig {
    hints: Hint[];
    hintState: HintState;
    onHintClick: (hintType: HintType) => void;
}

export class HintsMenu {
    private config: HintsMenuConfig;
    private element: HTMLElement | null = null;
    private menuElement: HTMLElement | null = null;
    private isOpen: boolean = false;

    constructor(config: HintsMenuConfig) {
        this.config = config;
    }

    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'hints-menu-container';

        // Button to open menu
        const button = document.createElement('button');
        button.className = 'hints-menu-button';
        button.textContent = '💡 Podpowiedzi';
        button.addEventListener('click', () => this.toggleMenu());
        container.appendChild(button);

        // Menu dropdown
        const menu = document.createElement('div');
        menu.className = 'hints-menu';
        menu.classList.add('hidden');
        this.menuElement = menu;

        const menuTitle = document.createElement('div');
        menuTitle.className = 'hints-menu-title';
        menuTitle.textContent = 'Podpowiedzi';
        menu.appendChild(menuTitle);

        const hintsList = document.createElement('div');
        hintsList.className = 'hints-list';

        this.config.hints.forEach(hint => {
            const hintItem = this.createHintItem(hint);
            hintsList.appendChild(hintItem);
        });

        menu.appendChild(hintsList);
        container.appendChild(menu);

        // Close menu when clicking outside
        document.addEventListener('click', (e: MouseEvent) => {
            if (this.isOpen && !container.contains(e.target as Node)) {
                this.closeMenu();
            }
        });

        this.element = container;
        return container;
    }

    private createHintItem(hint: Hint): HTMLElement {
        const item = document.createElement('div');
        item.className = 'hint-item';
        
        if (!hint.enabled) {
            item.classList.add('disabled');
        }
        if (hint.used && hint.id === 'show_letters') {
            item.classList.add('used');
        }

        const name = document.createElement('div');
        name.className = 'hint-item-name';
        name.textContent = hint.name;
        if (hint.used && hint.id === 'show_letters') {
            name.textContent += ' ✓';
        }
        item.appendChild(name);

        const description = document.createElement('div');
        description.className = 'hint-item-description';
        description.textContent = hint.description;
        item.appendChild(description);

        if (hint.enabled) {
            // For show_letters, check if used
            if (hint.id === 'show_letters' && hint.used) {
                // Already used, don't make clickable
            } else {
                item.addEventListener('click', () => {
                    this.config.onHintClick(hint.id);
                    this.closeMenu();
                });
                item.style.cursor = 'pointer';
            }
        }

        return item;
    }

    private toggleMenu(): void {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    private openMenu(): void {
        if (this.menuElement) {
            this.menuElement.classList.remove('hidden');
            this.isOpen = true;
        }
    }

    private closeMenu(): void {
        if (this.menuElement) {
            this.menuElement.classList.add('hidden');
            this.isOpen = false;
        }
    }

    update(config: Partial<HintsMenuConfig>): void {
        this.config = { ...this.config, ...config };
        if (this.element && this.menuElement) {
            // Re-render hints list
            const hintsList = this.menuElement.querySelector('.hints-list');
            if (hintsList) {
                hintsList.innerHTML = '';
                this.config.hints.forEach(hint => {
                    const hintItem = this.createHintItem(hint);
                    hintsList.appendChild(hintItem);
                });
            }
        }
    }

    getElement(): HTMLElement | null {
        return this.element;
    }
}

