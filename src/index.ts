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
  // check if the necessary argument are given 
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
    extractHTMLtables(url)
    .then( (div : HTMLDivElement) => {
      let tables : [HTMLTableElement,HTMLTableElement] = giveStyle(req.query.style,div)
      res.send(tables[0].outerHTML + tables[1].outerHTML )
    })
    .catch( (err) => {
      res.send(err)
      console.error(err)
    })
  }
});
/**
 * construct and return the url www.ffvbbeach.org location to extract the \<html\> with ranking and days
 * 
 * @param query 
 * @returns url www.ffvbbeach.org location to extract the \<html\>
 */
function getFFVBurl(query: {saison : string, poule: string, codent: string} ) : string{
  return "https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php?saison=" + query.saison + "&codent=" + query.codent + "&poule=" + query.poule
}

/**
 * Promise that get the \<html\> of "url" and extract the \<table\>
 * 
 * @param url www.ffvbbeach.org location to extract the \<html\>
 * @returns Promise that resolve a \<div\> with 2 \<table\> as children (ranking and days)
 * else reject an error (json format)
 */
function extractHTMLtables(url: string) : Promise<HTMLDivElement> {
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
      } else {
        let div = dom.window.document.createElement("div")
        div.innerHTML = tables[2].outerHTML + tables[3].outerHTML
        resolve( div ) // div [ ranking, days ]
      }
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
/**
 * Set a style of the \<table\> according to "style"
 *
 * @param style the style to set
 * @param div the \<div\> containing 2 \<table\> as children (ranking and days)
 * @returns array[\<table\> ranking ,\<table\> days]
 */
function giveStyle(style : string, div : HTMLDivElement) : [HTMLTableElement,HTMLTableElement]{
  let ret : HTMLCollectionOf<HTMLTableElement> = div.getElementsByTagName("table")
  if (style == "dark-softBlue") {

    /// tr style /// 
    let trAll = div.querySelectorAll("tr")
    for (let i = 0; i < trAll.length; i++) {
      if (i%2) {
        trAll[i].style.backgroundColor = "rgba(22,18,98,0.35)"
        trAll[i].bgColor = ""
      } else {
        trAll[i].bgColor = ""
      }
    }

    ret[0].style.backgroundColor = "rgba(22,18,98,0.25)"
    ret[0].style.color="white"

    ret[1].style.backgroundColor = "rgba(22,18,98,0.25)"
    ret[1].style.color="white"
    

    // td score style //

    ret[1].querySelectorAll("tr td:nth-child(7),tr td:nth-child(8)")
    .forEach( (e : HTMLTableCellElement) => {
      if (e.innerHTML == '3'){
        e.style.backgroundColor = "FireBrick"
      }else if (e.bgColor != ''){
        e.style.backgroundColor = "SlateGray"
      }
    })
  
    ret[1].querySelectorAll("tr:nth-child(6n+1)")
    .forEach( (e : HTMLElement) => {
      e.style.backgroundColor ="rgb(64,92,223)"
      e.style.fontWeight="600"
    })
    let first = ret[0].querySelector("tr")
    first.style.backgroundColor = "rgb(64,92,223)"
    first.style.fontWeight="600"
  }
  return [ret[0], ret[1]]
}

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});




