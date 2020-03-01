module.exports = {
    colors: {
        red: '\x1B[31m',
        blue: '\x1B[34m',
        green: '\x1B[32m',
        yellow: '\x1B[33m'
    },
    backgroundColors: {
        red: '\x1B[41m',
        blue: '\x1B[44m',
        green: '\x1B[42m',
        yellow: '\x1B[43m'
    },
    reset: '\x1B[0m',
    move: {
        up: '\x1B[A',
        back: '\x1B[D',
        forward: (n = 1) => `\x1B[${n}C`,
        down: '\x1B[B'
    }
}