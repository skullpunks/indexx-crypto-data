// server/index.js

const express = require("express");
const httpStatus = require('http-status')
const axios = require('axios')
const fs = require("fs");
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const PORT = process.env.PORT || 4000;
const app = express();

const readPricesCSV = async () => {
}

// readPricesCSV();

const getHistoryPrices = async (token, date) => {
    try {
        let url = 'https://api.coingecko.com/api/v3/coins/' + token + '/history?date=' + date;
        let data = await axios.get(url);
        // console.log(data.data.market_data.current_price.usd);
        return data.data.market_data.current_price.usd;
    } catch (error) {
        console.error(error)
    }
}

const storePrices = async () => {
    const writableStream = fs.createWriteStream("./indexxCrypto.csv");
    //   const writableStream = fs.createWriteStream("./currentPrices.csv");

    const columns = [
        "Date",
        "Price"
    ];

    var percent = {
        "bitcoin": 0.1, "ethereum": 0.1, "binancecoin": 0.08, "ripple": 0.08, "cardano": 0.08
        , "solana": 0.08, "polkadot": 0.08, "dogecoin": 0.05, "avalanche-2": 0.05, "shiba-inu": 0.05
        , "matic-network": 0.05, "tron": 0.05, "ethereum-classic": 0.05, "litecoin": 0.05, "ftx-token": 0.05
    };

    const stringifier = stringify({ header: true, columns: columns });
    var date = "15-08-2022";
    var finalPrice = 0;
    console.log("start Writing");
    for (const [key, value] of Object.entries(percent)) {
        var x = await getHistoryPrices(key, date);
        finalPrice = finalPrice + value * x;
        console.log(key, value, x);
    }

    stringifier.write([date, finalPrice]);
    stringifier.pipe(writableStream);
    console.log("Finished writing data");
}
//  storePrices();

const getCurrentPrices = async () => {
    try {
        token = "bitcoin%2Cethereum%2Cbinancecoin";
        let url =
            'https://api.coingecko.com/api/v3/simple/price?ids=' +
            token +
            '&vs_currencies=usd';

        let data = await axios.get(url);
        // console.log(data.data);
        return data.data;

    } catch (error) {
        console.error(error)
    }
}

const aggregatePrice = async () => {

    try {

        var percent = {
            "bitcoin": 0.1, "ethereum": 0.1, "binancecoin": 0.08, "ripple": 0.08, "cardano": 0.08
            , "solana": 0.08, "polkadot": 0.08, "dogecoin": 0.05, "avalanche-2": 0.05, "shiba-inu": 0.05
            , "matic-network": 0.05, "tron": 0.05, "ethereum-classic": 0.05, "litecoin": 0.05, "ftx-token": 0.05
        };

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = dd + '-' + mm + '-' + yyyy;

        var date = today;
        var finalPrice = 0;

        for (const [key, value] of Object.entries(percent)) {
            var x = await getHistoryPrices(key, date);
            finalPrice = finalPrice + value * x;
            if (key == "ftx-token"){
                return finalPrice;
            }
        }

    } catch (error) {
        console.error(error)
    }
}

app.get("/readCryptoPeriodPrice", async (req, res) => {

    var date = [];
    var close = [];
    res.set('Access-Control-Allow-Origin', '*');

    fs.createReadStream("./currentPrices.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            date.push(row[0]);
            close.push(row[1]);
        })
        .on("end", function () {
            res.status(200).send({ date,close });
        })
        .on("error", function (error) {
            console.log(error.message);
        });
});

app.get("/indexxCryptoPrice", async (req, res) => {
    price = await aggregatePrice();
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send({ "price": price });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});