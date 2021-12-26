export const writeText = async (text: string) => {
    const data = await navigator.clipboard.writeText(text)
    return data
}
