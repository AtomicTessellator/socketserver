
function atos(arr) {
    for (var i=0, l=arr.length, s='', c; c = arr[i++];)
        s += String.fromCharCode(
            c > 0xdf && c < 0xf0 && i < l-1
                ? (c & 0xf) << 12 | (arr[i++] & 0x3f) << 6 | arr[i++] & 0x3f
            : c > 0x7f && i < l
                ? (c & 0x1f) << 6 | arr[i++] & 0x3f
            : c
        );

    return s
}

module.exports = {
    atos: atos
}
