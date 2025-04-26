const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    try {
        const body = JSON.parse(event.body);
        const { song_name, artist } = body;

        const res = await fetch("http://139.59.140.159:8000/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ song_name, artist }),
        });

        const data = await res.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
