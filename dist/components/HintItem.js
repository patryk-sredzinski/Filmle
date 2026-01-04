export class HintItem {
    constructor(config) {
        this.element = null;
        this.config = config;
    }
    render() {
        let item;
        if (this.config.type === 'inner') {
            // Special type for year, budget, revenue with icon, value, arrow
            const block = document.createElement('div');
            block.className = 'hint-block';
            const inner = document.createElement('div');
            inner.className = `hint-inner hint-${this.config.color}`;
            if (this.config.tooltip) {
                inner.setAttribute('data-tooltip', this.config.tooltip);
            }
            if (this.config.icon) {
                const iconEl = document.createElement('div');
                iconEl.className = 'hint-icon';
                iconEl.textContent = this.config.icon;
                inner.appendChild(iconEl);
            }
            if (this.config.value !== undefined) {
                const valueEl = document.createElement('div');
                valueEl.className = this.config.icon ? 'hint-amount' : 'hint-value';
                valueEl.innerHTML = this.config.value;
                inner.appendChild(valueEl);
            }
            if (this.config.arrow) {
                const arrowEl = document.createElement('div');
                arrowEl.className = 'hint-arrow';
                arrowEl.textContent = this.config.arrow;
                inner.appendChild(arrowEl);
            }
            block.appendChild(inner);
            item = block;
        }
        else {
            // Other types
            item = document.createElement('span');
            switch (this.config.type) {
                case 'genre':
                    item.className = `genre-icon hint-${this.config.color}`;
                    break;
                case 'logo':
                    item.className = `company-logo hint-${this.config.color}`;
                    break;
                case 'flag':
                    item.className = `country-flag hint-${this.config.color}`;
                    break;
                case 'photo':
                    item.className = `actor-photo hint-${this.config.color}`;
                    if (this.config.imageUrl) {
                        item.classList.add('has-image');
                        item.style.backgroundImage = `url('${this.config.imageUrl}')`;
                    }
                    break;
                default:
                    item.className = `hint-item hint-${this.config.color}`;
            }
            if (this.config.tooltip) {
                item.setAttribute('data-tooltip', this.config.tooltip);
            }
            if (this.config.imageUrl) {
                item.setAttribute('data-image', this.config.imageUrl);
            }
            // Set content based on type
            if (this.config.type === 'flag') {
                const img = document.createElement('img');
                img.src = this.config.content || '';
                img.alt = this.config.tooltip || '';
                img.onerror = () => {
                    item.innerHTML = '<span style="font-size: 0.7em;">?</span>';
                };
                item.appendChild(img);
            }
            else if (this.config.type === 'logo') {
                if (this.config.imageUrl) {
                    const img = document.createElement('img');
                    img.src = this.config.imageUrl;
                    img.alt = this.config.tooltip || '';
                    img.onerror = () => {
                        item.innerHTML = `<span class="company-initials-fallback">${this.config.content || ''}</span>`;
                    };
                    item.appendChild(img);
                }
                else {
                    item.innerHTML = `<span class="company-initials-fallback">${this.config.content || ''}</span>`;
                }
            }
            else if (this.config.type === 'photo') {
                item.innerHTML = `<span class="actor-initials-fallback">${this.config.content || ''}</span>`;
            }
            else if (this.config.content) {
                item.innerHTML = this.config.content;
            }
        }
        this.element = item;
        return item;
    }
    getElement() {
        return this.element;
    }
    update(config) {
        this.config = { ...this.config, ...config };
        if (this.element) {
            // Re-render if type changed, otherwise update in place
            const newElement = this.render();
            if (this.element.parentNode) {
                this.element.parentNode.replaceChild(newElement, this.element);
            }
            this.element = newElement;
        }
    }
}
//# sourceMappingURL=HintItem.js.map