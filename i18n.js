window.I18n = {
    translations: {
        en: {
            pageTitle: 'Dart Checkout Trainer',
            navTrain: 'Train',
            navSectionMenu: 'Menu',
            navSectionLanguage: 'Language',
            labelCheckout: 'Checkout',
            labelRemaining: 'Remaining',
            resetBtn: 'Reset Darts',
            skipBtn: 'Skip Target',
            labelCheckoutTarget: 'Checkout Target',
            labelYourCheckout: 'Your Checkout',
            labelPremiumV1: 'Premium V. 1',
            labelPremiumV2: 'Premium V. 2',
            label2DartVariant: '2-Dart',
            nextBtn: 'Next Target',
            resultSuccess: '✓ Done!',
            resultFail: '✗ Not done',
            resultPremium: '⭐ Premium Checkout!',
            toggleRemaining: 'Remaining',
            toggleNumbers: 'Numbers'
        },
        de: {
            pageTitle: 'Dart Checkout Trainer',
            navTrain: 'Training',
            navSectionMenu: 'Menü',
            navSectionLanguage: 'Sprache',
            labelCheckout: 'Checkout',
            labelRemaining: 'Verbleibend',
            resetBtn: 'Darts zurücksetzen',
            skipBtn: 'Ziel überspringen',
            labelCheckoutTarget: 'Checkout Ziel',
            labelYourCheckout: 'Dein Checkout',
            labelPremiumV1: 'Premium V. 1',
            labelPremiumV2: 'Premium V. 2',
            label2DartVariant: '2-Dart',
            nextBtn: 'Nächstes Ziel',
            resultSuccess: '✓ Geschafft!',
            resultFail: '✗ Nicht geschafft',
            resultPremium: '⭐ Du hast einen Premium Checkout gespielt!',
            toggleRemaining: 'Restpunkte',
            toggleNumbers: 'Zahlen'
        }
    },

    currentLang: null,

    init(lang) {
        this.currentLang = lang;
        try {
            localStorage.setItem('dart-lang', lang);
        } catch (e) {
            // localStorage not available
        }
        document.documentElement.lang = lang;
    },

    t(key) {
        return this.translations[this.currentLang]?.[key] ??
               this.translations['en'][key] ??
               key;
    },

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
    }
};
