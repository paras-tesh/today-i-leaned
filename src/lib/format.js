const numbers = new Intl.NumberFormat('fa-IR')

export const fa = (n) => numbers.format(n)

export const toman = (n) => `${fa(n)} تومان`
