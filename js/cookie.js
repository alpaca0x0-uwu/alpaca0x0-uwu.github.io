const Cookie = {
    set(name, value, seconds = 60 * 60 * 24 * 30, path = window.location.pathname) {
        const expires = new Date(Date.now() + seconds * 1000).toUTCString()
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`
    },
    get(name) {
        const cookies = document.cookie.split('; ').map(c => c.split('='))
        const cookie = cookies.find(([key]) => decodeURIComponent(key) === name)
        return cookie ? decodeURIComponent(cookie[1]) : null
    },
    load(name) {
        try {
            let obj = JSON.parse(Cookie.get(name));
            return typeof obj === 'object' ? obj : {};
        } catch (error) { return {}; }
    },
}

export default Cookie
export { Cookie }
