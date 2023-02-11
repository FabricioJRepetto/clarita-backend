export const dateSort = (a, b) => {
    const A = new Date(a.in),
        B = new Date(b.out)
    if (A < B) {
        return -1;
    }
    if (A > B) {
        return 1;
    }
    return 0;
}