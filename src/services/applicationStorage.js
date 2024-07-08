// This is a utility file which uses either a versioned storage or a optional passed key to update storage on a user browser.
// Configuration: the application config is currently looking for a "config.app.storageVersion" located in the config file. example : { app: { storageVersion: 'v1' }}
// The typical usage of this would be to allow for being able to wipe user preferences in the event of a large change that would need for users to reinstate certain variables that have changed.
// However, you can pass a optional true to the functions to allow for bypassing all versioning.

/**
 * @description Sets a specific key and value in the users browser storage.
 * @param {*} key name representing the value
 * @param {*} value object
 * @param {boolean} [noVersion=false] optional skip to versioning of storage
 * @param {Storage} [system=localStorage] storage provider | default localStorage | options: localStorage, sessionStorage
 * @return {void} no return
 */
export const setStorageItem = (key, value, noVersion = false, system = localStorage) => {
    if (key !== null && key !== undefined) {
        const json = JSON.stringify(value);
        const trueKey = `${key}`;
        system.setItem(trueKey, json);
    }
};

/**
 * @description Gets a specific value from the users browser storage.
 * @param {*} key name representing the value
 * @param {boolean} [noVersion=false] optional skip to versioning of storage
 * @param {Storage} [system=localStorage] storage provider | default localStorage | options: localStorage, sessionStorage
 * @return {*} object | value
 */
export const getStorageItem = (key, noVersion = false, system = localStorage) => {
    if (key !== null && key !== undefined) {
        const trueKey = `${key}`;
        const json = system.getItem(trueKey);
        return JSON.parse(json);
    }
    return null;
};

/**
 * @description Removes the specific passed key from the users browser storage.
 * @param {*} key name representing the value
 * @param {boolean} [noVersion=false] optional skip to versioning of storage
 * @param {Storage} [system=localStorage] storage provider | default localStorage | options: localStorage, sessionStorage
 * @return {void} no return
 */
export const removeStorageItem = (key, noVersion = false, system = localStorage) => {
    if (key !== null && key !== undefined) {
        const trueKey = `${key}`;
        system.removeItem(trueKey);
    }
};

/**
 * @description Clears the entire storage regardless of other keys present (might have unintended consequences if used).
 * @param {Storage} [system=localStorage] storage provider | default localStorage | options: localStorage, sessionStorage
 * @return {void} no return
 */
export const clearAllStorageItems = (system = localStorage) => {
    if (system.length > 0) {
        system.clear();
    }
};

export default {
    setStorageItem,
    getStorageItem,
    removeStorageItem,
    clearAllStorageItems
}