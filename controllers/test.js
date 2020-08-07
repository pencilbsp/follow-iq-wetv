const array = [1, 2, 3, 4, 5];

array.forEach((el, i) => {
    setTimeout(() => {
        console.log(el);
    }, i*1000);
});

// for (const el of array) {
//     setTimeout(() => {
//         console.log(el);
//     }, 1000);
// }