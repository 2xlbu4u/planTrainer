var http = require("http");
const fs = require("fs");
const config = require("./config");
var server = http.createServer((
    function (request, response)
    {
        var requested = "." + request.url;
        var docQS = requested.split("?");
        var docStr = docQS[0];
        var qs = "";
        if (docQS.length > 1)
            qs = docQS[1];

        if (requested === "./plans")
        {
            // Web service call
            let stripsdoc = fs.readFileSync('stripsHSv1.json');
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(stripsdoc);
            return;
        }

        // Web content call
        let requestedDoc = "";
        let headertype = "application/octet-stream";
        if (fs.existsSync(docStr))
        {
            requestedDoc = fs.readFileSync(docStr);

            if (docStr.endsWith(".html")) headertype = "text/html";
            else if (docStr.endsWith(".css")) headertype = "text/css";
            else if (docStr.endsWith(".js")) headertype = "application/javascript";
        }
        response.writeHead(200, { "Content-Type": headertype });
        //if (qs !== "")
        //    requestedDoc += "?" + qs;
        response.end(requestedDoc);
    }));
server.listen(config.port);
console.log("Server listening on port "+ config.port);