const Cookie = {
    set: (name, value, days = 7, path = '/') => {
        const d = new Date();
        d.setTime(d.getTime() + days*24*60*60*1000);
        document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=${path}`;
    },
    get: (name) => {
        const raw = Cookie.getRaw(name);

        if (!raw) return null; 
        if (raw === 'true') return true;
        if (raw === 'false') return false;
        if (!isNaN(raw)) {
        return raw.includes('.') ? parseFloat(raw) : parseInt(raw, 10);
        }
        return raw;
    },
    getRaw: (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length !== 2) return null;
        return parts.pop().split(';').shift();
    },
    remove: (name, path = '/') => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    }
};

function t(key, vars = {}) {
    let text = key;
    for (const k in vars) {
        text = text.replaceAll(`{${k}}`, vars[k]);
    }
    return text;
}