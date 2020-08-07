module.exports.full = epi => {
    return epi.filter((e) => {
        if (e.name.indexOf('preview') < 0) {
            return e;
        }
    });
};