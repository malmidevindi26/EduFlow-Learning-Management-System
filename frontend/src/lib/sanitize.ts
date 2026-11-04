export class InputValidationError extends Error{}

const TAG_PATTERN = /<\/?[a-z!?][^>]*>/i;

const WEB_URL = /^https?:\/\/[^\s]+$/i;
const UPLOAD_PATH = /^\/uploads\/[A-Za-z0-9._-]+$/;

const SKIP_KEYS = new Set(['password'])

export function hasMarkup(value: string){
    return TAG_PATTERN.test(value)
}

export function stripMarkupChars(value: string){
    return value.replace(/[<>]/g, '')
}

export function isWebUrl(value: string){
    return WEB_URL.test(value)
}

export function isUploadPath(value: string){
    return UPLOAD_PATH.test(value)
}

export function safeHref(url?: string | null){
    if (!url) return undefined
    return isWebUrl(url) ? url : undefined
}

function label(key: string){
    const words = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
    return words.charAt(0).toUpperCase() + words.slice(1)
}

export function validatePayload(value: unknown, key = ''): void{
    if(typeof value === 'string'){
        if(SKIP_KEYS.has(key)) return

        if(key.endsWith('Url') && value !== ''){
            const ok = key === 'fileUrl' ? isUploadPath(value) : isWebUrl(value)
            if(!ok){
                throw new InputValidationError(
                    key === 'fileUrl'
                      ? 'Files must be uploaded through the upload button'
                      : `${label(key)} must start with http:// or https://`,
                )
            }
            return
        }

        if(hasMarkup(value)){
            throw new InputValidationError(
                `${label(key || 'value')} must not contain HTML or script tags`,
            )
        }
        return
    }

    if(Array.isArray(value)){
        value.forEach((item) => validatePayload(item, key))
        return
    }

    if(value && typeof value === 'object'){
        for(const [k, v] of Object.entries(value)) validatePayload(v, k)
    }
}
