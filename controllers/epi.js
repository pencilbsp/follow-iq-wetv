module.exports.full = epi => {
    return epi.filter((e) => {
        if (e.indexOf('preview') < 0) {
            return e;
        }
    });
};