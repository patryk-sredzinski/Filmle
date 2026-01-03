# Instrukcja wdrożenia na GitHub Pages

## Krok 1: Przygotowanie repozytorium

1. Jeśli jeszcze nie masz repozytorium na GitHub, utwórz nowe:
   - Przejdź na https://github.com/new
   - Nazwij repozytorium (np. `filmole` lub `filmle`)
   - Wybierz **Public** (GitHub Pages wymaga publicznego repo dla darmowego planu)
   - **NIE** zaznaczaj "Add a README file" (jeśli już masz pliki lokalnie)

2. W terminalu, w folderze projektu wykonaj:

```bash
# Inicjalizuj repozytorium (jeśli jeszcze nie)
git init

# Dodaj wszystkie pliki
git add .

# Zrób pierwszy commit
git commit -m "Initial commit"

# Dodaj remote (zamień USERNAME i REPO_NAME na swoje)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Wypchnij na GitHub
git branch -M main
git push -u origin main
```

## Krok 2: Zbuduj aplikację

Przed wdrożeniem musisz zbudować aplikację (wbudować dane z movies.json do index.html):

```bash
node build-html.js
```

## Krok 3: Skonfiguruj GitHub Pages

1. Przejdź do swojego repozytorium na GitHub
2. Kliknij **Settings** (Ustawienia)
3. W menu po lewej stronie znajdź **Pages**
4. W sekcji **Source** wybierz:
   - Branch: `main`
   - Folder: `/ (root)`
5. Kliknij **Save**

GitHub automatycznie opublikuje Twoją stronę pod adresem:
`https://USERNAME.github.io/REPO_NAME/`

## Krok 4: Automatyczne buildowanie (opcjonalne)

Jeśli chcesz, aby GitHub automatycznie budował aplikację przy każdym pushu, użyj GitHub Actions (zobacz `.github/workflows/deploy.yml`).

## Ważne uwagi:

- **movies.json** jest duży - upewnij się, że jest w `.gitignore` jeśli nie chcesz go commitować
- Zbudowany `index.html` (z wbudowanymi danymi) **musi** być w repozytorium
- Po każdej zmianie w `movies.json` lub `app.js` musisz:
  1. Uruchomić `node build-html.js`
  2. Zcommitować zbudowany `index.html`
  3. Wypchnąć zmiany na GitHub






