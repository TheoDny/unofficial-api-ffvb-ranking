const express = require("express")
const jsdom = require("jsdom")
const { JSDOM } = jsdom;

const app = express();

const port = process.env.PORT || 3000

app.all("/", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  return next();
});

app.get('/', (req, res ) => {
  if (req.query.saison == undefined || req.query.codent == undefined || req.query.poule == undefined) {
    res.send(
    {
    'error': {
      'code': 500,
      'message': 'Missing argument in the request, be sure it contain the arguments: saison , codent , poule'
      }
    })
  } else {
    const url = getFFVBurl(req.query)
    sendHTMLtables(url)
    .then( (tables : HTMLCollectionOf<HTMLTableElement> ) => {
      res.send(tables[0].outerHTML + tables[1].outerHTML )
    })
    .catch( (err) => {
      res.send(err)
      console.error(err)
    })
  }
});

function getFFVBurl(query) {
  return "https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php?saison=" + query.saison + "&codent=" + query.codent + "&poule=" + query.poule
}

function sendHTMLtables(url: string) {
  return new Promise( (resolve,reject) => {

    var resourceLoader = new jsdom.ResourceLoader({
      strictSSL: false,
  });

  var options = { 
      resources: resourceLoader,
  };

  jsdom.JSDOM.fromURL(url, options) 
    .then(dom => {
      let tables = dom.window.document.querySelectorAll("table")
      if (tables[2] == null || tables[3] == null) {
        reject(
          {
            'error': {
              'code': 500,
              'message': 'Wrongs arguments in the request, be sure it contain the right arguments: saison , codent , poule'
              }
            }
        )
    }
      resolve( [ tables[2], tables[3] ] ) // [ ranking, days ]
    })
    .catch((error => {
      console.error(error)
      reject({
        'error': {
          'code': 0,
          'message': 'rejected from ' + url
          }
        })
    }))
  })
}

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});




