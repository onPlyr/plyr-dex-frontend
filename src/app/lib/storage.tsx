import { defaultStorageType, storageDataContainerKey } from "@/app/config/storage"
import { StorageDataKey, StorageDataType, StorageType } from "@/app/types/storage"

// from: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability
export const isStorageAvailable = (storageType?: StorageType) => {
    const type = storageType ? storageType : defaultStorageType
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

export const getStorage = (type?: StorageType) => {
    return type !== defaultStorageType && type === StorageType.Session ? sessionStorage : localStorage
}

export const getStorageData = (type?: StorageType) => {
    const isAvailable = isStorageAvailable(type)
    if (isAvailable) {
        const storage = getStorage(type)
        const data = storage.getItem(storageDataContainerKey)
        return data ? JSON.parse(data) as StorageDataType : undefined
    }
    return undefined
}

export const getStorageItem = (key: StorageDataKey, type?: StorageType) => {
    return getStorageData(type)?.[key]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setStorageItem = (key: StorageDataKey, data: any, type?: StorageType) => {
    const storage = getStorage(type)
    const storageData = getStorageData(type)
    const newData = {
        ...storageData,
        [key]: data,
    } as StorageDataType
    storage.removeItem(storageDataContainerKey)
    storage.setItem(storageDataContainerKey, JSON.stringify(newData))
}
