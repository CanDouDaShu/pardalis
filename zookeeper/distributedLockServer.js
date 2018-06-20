'use strict'
const ZK = require('./init');
function init() {
    return ZK.init()
        .then(() => {
            ZK.conn()
                .then(() => {
                    ZK.createNode({
                        path: '/5th/lock',
                        data: 'distributedLock'
                    }).then(() => {})
                        .catch((err) => {
                            throw new Error(err);
                        });
                }).catch((err) => {
                throw new Error(err);
            });
        }).catch((err) => {
        throw new Error(err);
    });
}


module.exports = init;