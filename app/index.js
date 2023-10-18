const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;

require('dotenv').config();

const API = "http://localhost:3004/";

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.APP_TOKENBOT;
const uriMongoDB = process.env.APP_URIMONGODB;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

mongoose.set('strictQuery', false);
mongoose.connect(uriMongoDB)
.then(()=>{
  console.log("conectado MD")
})
.catch(console.log)

const Schema = mongoose.Schema;

const Precios = new Schema({
  par: String,
  valor: Number,
  date: Date,
  epoch: Number
});

const PrecioBRST = mongoose.model('brst', Precios);
const PrecioBRUT = mongoose.model('brut', Precios);

/*
- Negrita: <b>texto en negrita</b>, <strong>negrita</strong>
- Cursiva: <i>texto en cursiva</i>, <em>cursiva</em>
- Subrayado: <u>texto subrayado</u>, <ins>subrayado</ins>
- Tachado: <s>texto tachado</s>, <strike>tachado</strike>, <del>tachado</del>
Enlaces: <a href="https://www.Tecnonucleous.com/">Tecnonucleous</a>
<a href="tg://user?id=123456789">inline mention of a user</a>
- Código: <code>texto con el código</code>
- Indica a la API que debe respetar los saltos de línea y los espacios en blanco: <pre>Texto con saltos de línea y espacios</pre>
*/

var comandos = {
  steven: "El más inteligente",
  manuel: "El más insistente",
  vicente: "El más tranquilo",
  prendeme: "Esto esta prendido mijo!!",
  prender: "Vicente quiere que lo prenda",
  apagar: "Manuel quiere que lo apage",
  brut: "brut",
  BRUT: "brut",
  brst: "brst",
  BRST: "brst",
  boletin: "boletin",
  BOLETIN: "boletin",
  Boletin: "boletin"
  //energia: "Solicita energia y recibe de acuerdo a tu hold de BRST + 10% extra, escribe el comando: <pre>/energiatron <b>TB7R...4XvF</b> </pre>",
  //energiatron: "ahí te va la energia"
}

var listaBoletin = [ 
  -1001540123789, //privado
  -1001675055650 //publico

]


var boletin = new CronJob('0 10 * * *', async function() {
  for (let index = 0; index < listaBoletin.length; index++) {
    bot.sendMessage(listaBoletin[index], await miBoletin(), { parse_mode : "HTML"});
    
  }
  console.log('Boletín enviado');
}, null, true, 'America/Bogota');

boletin.start();

async function consultar(apiUrl){

  return await fetch(apiUrl)
    .then(response => {
      //console.log(response);
      return response.json();
    })
    .then(data => {
      //console.log(data);
      return data.Data;

    }).catch(() => {
        
      return {trx: "##", usd: "##"};
    });

}

async function miBoletin(){

  var fecha = new Date(Date.now());

  return "🤖 BRUTUS BOLETÍN 🤖\n<pre>    "+ fecha.getDate() +"/"+ (fecha.getMonth()+1) +"/"+ fecha.getFullYear() +"</pre>\n----------------------------------------------------\n"+await brst()+'\n\n'+await brut()+'\n----------------------------------------------------\n⚡<a href="https://t.me/BRUTUS_energy_bot">¡Alquila energía con BRUTUS!</a>⚡';

}

async function brut(){

  var Data = await consultar(API+'api/v1/precio/BRUT');
  
  return "#BRUT\n🟠<b> "+Data.usd+"</b> USDT";
}

async function brst(){
  
  var Data = await consultar(API+'api/v1/precio/BRST');
  
  return "#BRST\n🔴<b> "+Data.trx+"</b> TRX";
}


console.log("Listo!!!")

// Matches "/echo [whatever]"
/*bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  console.log(match)

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});*/

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async(msg) => {
  const chatId = msg.chat.id;

  if(msg.entities){

    for (let index = 0; index < msg.entities.length; index++) {
      var comando = (msg.text).substring(msg.entities[index].offset+1, msg.entities[index].length)

      if(comando.split("@").length > 0){
        comando = comando.split("@")[0];
      }

      if(comandos[comando]){
        switch (comandos[comando]) {
          case "brut":
            bot.sendMessage(chatId, await brut(), { parse_mode : "HTML"});
            
            break;

          case "brst":
            bot.sendMessage(chatId, await brst(), { parse_mode : "HTML"});
            
            break;

          case "boletin":
            bot.sendMessage(chatId, await miBoletin(), { parse_mode : "HTML"});
            
            break;
        
          default:
            bot.sendMessage(chatId, comandos[comando], { parse_mode : "HTML"});
            break;
        }

      }
      
      
      
    }
    
    
  }else{

    if(msg.text){
      // send a message to the chat acknowledging receipt of their message
      var Hi = "Hola brutus";
      if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(chatId, 'Hola '+msg.from.first_name+' que puedo hacer por ti?');
      }

      if (msg.text.toString().toLowerCase().includes("adios") || msg.text.toString().toLowerCase().includes("adiós")) {
        bot.sendMessage(chatId, 'Adiós '+msg.from.first_name+' que vaya bien.');

      }
      var text = "eres un robot";
      if (msg.text.toString().toLowerCase().includes(text)) {
          bot.sendMessage(msg.chat.id, "Si soy un robot!");
      }
      var text = "presentar";
      if (msg.text.toString().toLowerCase().includes(text)) {
          bot.sendMessage(msg.chat.id, "vale, soy el ayudante de mis padres /manuel /vicente y /steven, soy de la 4ta queneración de bots que han desarrollado y basicamente estoy para brindar informacion del proyecto!");
      }

      var text = "quien eres";
      if (msg.text.toString().toLowerCase().includes(text)) {
        bot.sendMessage(msg.chat.id, "Hola soy el BRUTUS BOT V2!");
      }

      var myid = "myid";
      if (msg.text.toString().toLowerCase().includes(myid)) {
          bot.sendMessage(msg.chat.id, msg.chat.id);
      }
    }
    
  }

  
});