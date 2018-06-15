// const pub = require('./publish');
//
//
// pub.connect()
//     .then(() => {
//         pub._send('argus', 'offline_calculate_register_award', {lj: 'lj'});
//
//
//         pub.channel.get('offline_calculate_register_award')
//             .then(res => {
//                 console.log(res);
//             })
//     });


// var AMQPStats = require('amqp-stats');
//
// var stats = new AMQPStats({
//     username: "guest", // default: guest
//     password: "guest", // default: guest
//     hostname: "localhost:15672",  // default: localhost:55672
//     protocol: "http"  // default: http
// });
// stats.queues(function(err, res, data){
//     if (err) {
//         console.log(err);
//     }
//     console.log(data[0]);
// });
// stats.overview(function(err, res, data){
//     if (err) {
//         console.log(err);
//     }
//     console.log('data: ', data);
// });


const publish = require("./publish");

publish.init_connect()
.then(() => {
    publish.init_channel_with_transaction()
        .then(() => {
            publish.setup_topology('direct');
        })
})