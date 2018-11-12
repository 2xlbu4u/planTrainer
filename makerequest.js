var config = require('./config');
const cheerio = require('cheerio');
var request = require('request');

    request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: config.nyartccURL + "?from=KBOS&to=KJFK",
            body: ""
    },
        function (error, response, body)
        {
            //console.log(body);

            const $ = cheerio.load(body);

            var tbody = $(".table-striped").find('tbody');
            var routes = [];
            $(tbody).children().each(function (index, tr)
            {
                var line = [];
                var headings = ["from", "route", "to", "area", "altitude", "aircraft", "cfrom", "cto", "zpref"];
                var route = {};
                $(tr).find('td').each(function (index, td)
                {
                    route[headings[index]] = $(td).html();
                   // line.push($(td).html());
                });
                routes.push(route);
            });
            console.log(routes);

    });

//      var trs = html.find('.znypref').parents().eq(2).find('tbody');