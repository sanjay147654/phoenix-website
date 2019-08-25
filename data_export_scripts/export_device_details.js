var mysql = require('mysql'),
    _ = require('lodash'),
    json2csv = require('json2csv').parse,
    fs = require('fs');

const mysql_connection_pool = mysql.createPool({
        connectionLimit : 2,
        host                    : 'phoenixrobotix-main-db.cqmqj3e9zyxp.ap-south-1.rds.amazonaws.com',
        user                    : '~]]^MfJL[]~FTFl{',
        password                : 'zLIqSaRMLkTf%2;TC1J((svz',
        database                : 'phoenzbi_data',
        multipleStatements: true
});

const isValidJSON = (json_string) => {
    try {
        JSON.parse(json_string);
    } catch (e) {
        return false;
    }
    return true;
};

const csvOptions = {
        fields: [
                {
                        label: 'QR Code',
                        value: 'qr_code'
                },
                {
                        label: 'Device Type',
                        value: 'type'
                },
                {
                        label: 'Station Name',
                        value: 'name'
                },
                {
                        label: 'Latitude',
                        value: 'lat'
                },
                {
                        label: 'Longitude',
                        value: 'long'
                }
        ],
        doubleQuote: '"'
};

let devices = {},
    csvData = [];

mysql_connection_pool.query('SELECT iot_devices.idev_id, iot_devices.idev_qr_code, iot_device_types.idt_name FROM iot_devices INNER JOIN iot_device_types ON iot_devices.idt_id = iot_device_types.idt_id WHERE industry_id=365 AND serv_id=19 AND idev_is_active=1', (err, results) => {
    if(err) {
        console.log('Devices query error');
        return;
    }
    results.map((result) => {
        devices[result.idev_id.toString()] = {
            qr_code: result.idev_qr_code,
            type: result.idt_name
        };
    });
    mysql_connection_pool.query('SELECT fms_name,fms_lat,fms_long,idev_id FROM flood_monitoring_stations WHERE clep_id=365', (err, results) => {
        if(err) {
            console.log('Stations query error');
            return;
        }
        results.map((result) => {
            let device_ids = (isValidJSON(result.idev_id) ? JSON.parse(result.idev_id) : []);
            console.log('device_ids -> ', device_ids);
            device_ids.map((device_id) => {
                devices[device_id.toString()].name = result.fms_name;
                devices[device_id.toString()].lat = result.fms_lat;
                devices[device_id.toString()].long = result.fms_long;
            });
        });

        Object.keys(devices).map((device_id) => {
            csvData.push({
                qr_code: devices[device_id].qr_code,
                type: devices[device_id].type,
                name: devices[device_id].name,
                lat: devices[device_id].lat,
                long: devices[device_id].long
            });
        });

        let csvString = json2csv(csvData, csvOptions);
        fs.writeFile('./flood_monitoring_devices.csv', csvString, (err) => {
            if(err) {
                return console.log(err);
            } else {
                console.log('successful');
            }
        });
    });
});
