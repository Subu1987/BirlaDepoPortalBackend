let rfc = require("node-rfc");
let rfcSettings = {
  user: process.env.RFC_USER,
  passwd: process.env.RFC_PASSWD,
  ashost: process.env.RFC_ASHOST,
  sysid: process.env.RFC_SYSID,
  sysnr: process.env.RFC_SYSNR,
  client: process.env.RFC_CLIENT,
  low: parseInt(process.env.RFC_LOW, 10),
  high: parseInt(process.env.RFC_HIGH, 10),
};
/*
let rfcSettings = {
    'user': 'bpcoesd01',
    'passwd': 'welcome2',
    'ashost': '52.172.130.94',
    'sysid': 'BSQ',
    'sysnr': '90',
    'client': '700'
};*/
//const client = new rfc.Client(rfcSettings);

/*
client.open().then(() => {
    console.log("connected to rfc")
})
.catch(err => {
    console.error('could not acquire connection', err);
});
*/

module.exports = rfcSettings;
