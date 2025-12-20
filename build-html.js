const fs = require('fs');
const path = require('path');

console.log('Wczytywanie danych z movies.json...');

// Wczytaj movies.json
const moviesJson = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
console.log(`Wczytano ${moviesJson.length} filmów`);

// Wczytaj index.html
let htmlContent = fs.readFileSync('index.html', 'utf8');

// Generuj inline script z danymi - używamy minifikacji JSON aby zmniejszyć rozmiar
const moviesDataJson = JSON.stringify(moviesJson);
const inlineScript = `
    <script>
        // Automatycznie wygenerowane dane z movies.json
        window.MOVIES_DATA = ${moviesDataJson};
    </script>
`;

// Wstaw inline script przed zamknięciem </body>
if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', inlineScript + '\n    </body>');
} else {
    // Jeśli nie ma </body>, dodaj na końcu
    htmlContent = htmlContent.trim() + inlineScript + '\n</body>\n</html>';
}

// Zapisz zaktualizowany HTML
fs.writeFileSync('index.html', htmlContent);
console.log('✓ Zaktualizowano index.html z wbudowanymi danymi');
console.log(`Rozmiar danych: ${(moviesDataJson.length / 1024 / 1024).toFixed(2)} MB`);


