import { getCompanyInitials } from '../../utils.js';
export class CompanyHint {
    static createForGuess(config) {
        const { companies, comparison } = config;
        if (!comparison) {
            return {
                type: 'companies',
                items: []
            };
        }
        const companyItems = companies.map(company => ({
            type: 'logo',
            color: (comparison.matches.includes(company.name) ? 'green' : 'red'),
            content: getCompanyInitials(company.name),
            tooltip: company.name,
            imageUrl: company.logo_path ? `https://image.tmdb.org/t/p/w500${company.logo_path}` : undefined
        }));
        return {
            type: 'companies',
            items: companyItems
        };
    }
    static createForMystery(config) {
        const { matchedCompanyNames, companies } = config;
        if (!matchedCompanyNames || matchedCompanyNames.length === 0) {
            return {
                type: 'companies',
                items: []
            };
        }
        // Find logos for matched names
        const companyItems = matchedCompanyNames.slice(0, 3).map(companyName => {
            const company = companies.find(c => c.name === companyName);
            const logoUrl = company?.logo_path
                ? `https://image.tmdb.org/t/p/w780${company.logo_path}`
                : undefined;
            return {
                type: 'logo',
                color: 'green',
                content: getCompanyInitials(companyName),
                tooltip: companyName,
                imageUrl: logoUrl
            };
        });
        return {
            type: 'companies',
            items: companyItems
        };
    }
}
//# sourceMappingURL=CompanyHint.js.map