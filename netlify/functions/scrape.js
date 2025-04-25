const fetch = require('node-fetch');

exports.handler = async function(event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }

    try {
        const body = JSON.parse(event.body);

        const response = await fetch("http://139.59.140.159:8000/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.text(); // nu .json() ca să evităm erori
        return {
            statusCode: 200,
            body: data
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
