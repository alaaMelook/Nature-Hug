

class LangStore {
    private language: LangKey = "en";
    private listeners: Set<LangChangeListener> = new Set();

    get() {
        return this.language;
    }

    set(lang: LangKey) {
        if (this.language === lang) return;
        this.language = lang;
        this.notify(lang);
    }

    onChange(listener: LangChangeListener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener) }; // return unsubscribe fn
    }

    private notify(lang: LangKey) {
        this.listeners.forEach((listener) => listener(lang));
    }
}

export const langStore = new LangStore();
