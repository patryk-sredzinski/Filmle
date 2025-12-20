# 🎬 Filmle

Gra polegająca na odgadnięciu tajemniczego filmu w jak najmniejszej liczbie prób!

## Jak uruchomić

### Krok 1: Wygeneruj HTML z wbudowanymi danymi

Uruchom skrypt, który wbuduje dane z `movies.json` bezpośrednio w HTML:

```bash
node build-html.js
```

### Krok 2: Otwórz aplikację

**Nie potrzebujesz serwera!** Po prostu otwórz plik `index.html` w przeglądarce (podwójne kliknięcie lub przeciągnięcie do przeglądarki).

Wszystkie dane są już wbudowane w aplikację, więc działa od razu!

## Jak grać

1. Aplikacja losuje tajemniczy film z bazy danych
2. Wpisz tytuł filmu w wyszukiwarce (autouzupełnianie pomoże Ci znaleźć film)
3. Po wybraniu filmu zobaczysz jego statystyki i porównanie z tajemniczym filmem:
   - **Rok wydania** - czy jest wcześniejszy/późniejszy
   - **Gatunki** - czy są wspólne gatunki
   - **Budżet** - czy jest wyższy/niższy
   - **Przychód** - czy jest wyższy/niższy
   - **Firmy produkcyjne** - czy są wspólne firmy
   - **Kraje produkcyjne** - czy są wspólne kraje
   - **Obsada** - czy są wspólni aktorzy
4. Użyj tych wskazówek, aby odgadnąć tajemniczy film w jak najmniejszej liczbie prób!

## Funkcje

- ✅ Wyszukiwarka z autouzupełnianiem (tytuł i oryginalny tytuł)
- ✅ Porównywanie wszystkich statystyk filmów
- ✅ Kolorowe wskaźniki pokazujące różnice
- ✅ Licznik prób
- ✅ Możliwość rozpoczęcia nowej gry w dowolnym momencie

