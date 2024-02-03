// using utility folder to add and use extra files like expressError and wrapAsync
module.exports = (fn) => {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    }
}

