import { getCompanyInitials } from '../../utils.js';
export class CompanyHint {
    static create(config) {
        const { company, isMatch } = config;
        return {
            type: 'logo',
            color: (isMatch ? 'green' : 'red'),
            content: getCompanyInitials(company.name),
            tooltip: company.name,
            imageUrl: company.logo_path ? `https://image.tmdb.org/t/p/w500${company.logo_path}` : undefined
        };
    }
}
//# sourceMappingURL=CompanyHint.js.map