export const doDatesOverlap = (a1, a2, b1, b2) => {
    const a = new Date(a1),
        b = new Date(a2),
        x = new Date(b1),
        y = new Date(b2)

    if ((x >= a && x < b) || (x < a && y > a))
        return true
    else
        return false
}

/* 
    ? para comprobar equidad hacer lo siguiente
        aDate = new Date('12/5/2023'), <== new Date(x date).toLocaleString('en')
        Today = new Date('12/5/2023') <== new Date().toLocaleString('en')
    ? (eDate.getTime() === Today.getTime()) 
    ...
    ? >= y <= funcionan sin problema
*/