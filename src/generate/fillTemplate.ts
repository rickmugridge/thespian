export const fillTemplate = (template: string, fillers: any) => {
    let result = template
    Object.keys(fillers).forEach(key => {
        result = result.replace(new RegExp(`@{${key}}`, 'g'), fillers[key])
    })
    return result
}