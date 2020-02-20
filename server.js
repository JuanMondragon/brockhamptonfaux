if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}



const stripeSecrectKey =process.env.STRIPE_SECRECT_KEY
const stripePublicKey =process.env.STRIPE_PUBLIC_KEY

const stripe =require('stripe')(stripeSecrectKey)



const express = require
('express')
const app =express()
const fs =require('fs');

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static
    ('public'))

app.get('/store', function(req, res){
    fs.readFile('items.json', function(err, data){
        if(err){
            res.status(500).end()
        } else {
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })

})

app.post('/purchase', function(req, res){
    fs.readFile('items.json', function(err, data){
        if(err){
            res.status(500).end()
        } else {
            const itemsJson =JSON.parse(data)
            const itemsArray = itemsJson.music.concat(itemsJson.merch)
            let total = 0
            req.body.items.forEach(function(item){
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id
                })
                total = total + itemJson.price * item.quantity
            })
            stripe.charges.create({
                amount:total,
                source:req.body.stripeTokenId,
                currency: 'usd'
            }).then(function(){
                console.log('SUCCESS')
                res.json({message:' Successfully purchased items'})
            }).catch(function(){
                console.log(':(')
                res.status(500).end()
            })
        }
    })

})

app.listen(3000)