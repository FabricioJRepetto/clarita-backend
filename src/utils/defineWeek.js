export const defineWeek = (d) => {
    if (!d) return {
        today: 'error: no date',
        start: 'error: no date',
        end: 'error: no date'
    }
    // convierto la String a Date
    let date = new Date(d),
        // averiguo el numero del dia (7 si es Domingo)
        day = (date.getDay() === 0) ? 7 : date.getDay(),
        // averiguo el Lunes de esa semana
        firstDay = date.getDate() - (day - 1),
        // everiguo el Domingo de esa semana y convierto a Date
        lastDay = new Date(new Date(d).setDate(firstDay + 6)).toLocaleDateString('en'),
        // innecesario en este caso
        today = date.toLocaleDateString('en'),
        // utilizo el numero del Lunes para generar nuevo Date
        start = new Date(new Date(d).setDate(firstDay)).toLocaleDateString('en'),
        // fecha de Domingo lista, cambio nombre
        end = lastDay;
    //: no creo fecha del Lunes en primera instancia porque necesito el numero para saber la fecha del Domingo

    return {
        today,
        start,
        end
    }
}