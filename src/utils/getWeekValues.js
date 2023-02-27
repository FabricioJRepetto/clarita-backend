export const getWeekValues = (start, end, data) => {
    if (!data) return {}
    const aux = {}

    data.forEach(e => {
        const date = new Date(e.date),
            START = new Date(start),
            END = new Date(end)

        if (date >= START && date <= END) {
            aux[e.date]
                ? aux[e.date].push(e)
                : aux[e.date] = [e]
        }
    });

    return aux
}