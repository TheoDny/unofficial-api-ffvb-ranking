# unofficial-api-ffvb-ranking

renvoie les 2 `<table>` au format :
```html
<table>
  ... //classement
</table>
<table>
  ... // journees
</table>
```

*remarque: renvoie le copié collé venant https://www.ffvbbeach.org il y a donc des élements superflux/non liés/manquants (images,liens,scriptes...)*

## Usage
- saison = "XXXX/XXXX"
- codent = "...XX"
- poule = "XXX"

GET ->
 `
"https://get-ffvb-ranking-days.herokuapp.com/?saison=" + saison + "&codent=" + codent + "&poule=" + poule
`

*remarque: mon hébergement sur herokuapp est freemium donc si vous l'utilisez faites en sorte de ne pas spammer de requêtes et si je ne sais pourquoi trop de personnes l'utilisent, n'hésitez pas à déployer le vôtre*
