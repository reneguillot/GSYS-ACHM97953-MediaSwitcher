export const getParameterByName = (name) => {
    // eslint-disable-next-line
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
    const regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
        results = regex.exec(window.location.hash)
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

export const fetchWrapper = async (url, init) => {
    const response = await fetch(url, init)
    const json = await response.json()
    return response.ok ? json : Promise.reject(json)
}

export default {
    getParameterByName,
    fetchWrapper
}