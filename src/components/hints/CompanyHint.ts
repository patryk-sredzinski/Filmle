import { HintItemConfig } from '../HintItem.js';
import { ProductionCompany } from '../../types.js';
import { getCompanyInitials } from '../../utils.js';

export interface CompanyHintConfig {
    company: ProductionCompany;
    isMatch: boolean;
}

export class CompanyHint {
    static create(config: CompanyHintConfig): HintItemConfig {
        const { company, isMatch } = config;
        
        return {
            type: 'logo',
            color: (isMatch ? 'green' : 'red') as 'green' | 'red',
            content: getCompanyInitials(company.name),
            tooltip: company.name,
            imageUrl: company.logo_path ? `https://image.tmdb.org/t/p/w500${company.logo_path}` : undefined
        };
    }
}
