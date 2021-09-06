// Change
let coinTradeSymbol = "BTCUSDT", roundingTime = 2, unit = "TRY";

// Api Services
const binanceAPI = "https://api.binance.com/api/v3/ticker/24hr?symbol=", coinURL = binanceAPI + coinTradeSymbol;
const messariAPI = "https://data.messari.io/api/v1/assets/"; // FOR COIN NAME GETTING ONLY ONE TIME

let unitCharacter, unitBool = false;
switch (unit) {
  case "USDT":
    unitCharacter = "$";
    break;
  case "TRY":
    unitCharacter = "TL";
    break;
  case "EUR":
    unitCharacter = "£";
    break;
  default:
    unitCharacter = unit;
}

let coinInfo = {}, currencyPrice, currencyURL, messariBool = false;
let currencyList, specialList = ["BRL", "BIDR", "RUB", "TRY", "DAI", "IDRT", "UAH", "NGN", "BVND"];


startGetting();

function startGetting() {
  let currencyText = "BTC,ETH,BNB,TRX,XRP,USDT,BUSD,BRL,AUD,BIDR,EUR,GBP,RUB,TRY,TUSD,USDC,DAI,IDRT,PAX,UAH,NGN,VAI,BVND";
  currencyList = currencyText.split(',');

  setInterval(function () {
    getCoinInfo(coinURL);
  }, 500);
}

async function getCoinInfo(url) {
  let response, data;
  try {
    response = await fetch(url);
    data = await response.json();
  } catch (error) {
    alert("Coin bilgisi bulunurken hata ile karşılaşıldı. Hata 'coinTradeSymbol' değişkeni ile ilgilidir.");
  }

  if (response) {
    coinInfo.lastPrice = round(data.lastPrice, roundingTime);
    coinInfo.change24hrPrice = round(data.priceChange, roundingTime);
    coinInfo.change24hrPercent = round(data.priceChangePercent, 2);
    coinInfo.highPrice24hr = round(data.highPrice, roundingTime);
    coinInfo.lowPrice24hr = round(data.lowPrice, roundingTime);
    coinInfo.volumeWithLot24hr = round(data.volume, 2);
    coinInfo.volumeWithCurrency24hr = round(data.quoteVolume, 2);

    currencyURL = getCurrency();
    getCurrencyPrice(currencyURL);
  }
}

function getCurrency() {
  let tempURL, tempCurrency;

  for (let i = 0; i < currencyList.length; i++) {
    tempCurrency = currencyList[i];

    let bool1 = coinTradeSymbol.includes(tempCurrency), bool2 = coinTradeSymbol.indexOf(tempCurrency) != 0;
    let final = bool1 && bool2;

    if (final && tempCurrency != unit) {
      if (specialList.includes(tempCurrency)) {
        tempURL = `${binanceAPI}${unit}${tempCurrency}`;
        unitBool = true;
      } else if (specialList.includes(unit)) {
        tempURL = `${binanceAPI}${tempCurrency}${unit}`;
        unitBool = true;
      } else if (tempCurrency == "EUR") {
        tempURL = `${binanceAPI}${tempCurrency}${unit}`;
      } else if (unit == "EUR") {
        tempURL = `${binanceAPI}${unit}${tempCurrency}`;
      } else {
        tempURL = `${binanceAPI}${tempCurrency}${unit}`;
        unitBool = true;
      }

      coinInfo.currency = tempCurrency;
      coinInfo.coinSymbol = coinTradeSymbol.split(tempCurrency)[0];
    } else if (final && tempCurrency == unit) {
      coinInfo.currency = tempCurrency;
      coinInfo.coinSymbol = coinTradeSymbol.split(tempCurrency)[0];
      tempURL = "Not Necessary";
    }
  }

  return tempURL;
}

async function getCurrencyPrice(url) {
  if (url != "Not Necessary") {
    let response, data;
    try {
      response = await fetch(url);
      data = await response.json();
    } catch (error) {
      alert("Birim bilgisi bulunurken hata ile karşılaşıldı. Hata 'coinTradeSymbol' ve 'unit' değişkenleri ile ilgilidir.");
    }

    if (response) {
      currencyPrice = data.lastPrice;
      coinInfo.lastPriceWithUnit = unitBool ? round(coinInfo.lastPrice * currencyPrice, 2) : round(coinInfo.lastPrice / currencyPrice, 2);
    }
  } else {
    coinInfo.lastPriceWithUnit = round(coinInfo.lastPrice, 2);
  }

  if (messariBool == false) {
    getCoinName(messariAPI + coinInfo.coinSymbol);
  } else {
    fillTheData();
  }
}

function round(number, roundTime) {
  let tempRoundedNumber = parseFloat(number).toFixed(roundTime);
  return tempRoundedNumber;
}

async function getCoinName(url) {
  let response, body;
  try {
    response = await fetch(url);
    body = await response.json();
  } catch (error) {
    alert("Coin adı bulunurken hata ile karşılaşıldı. Hata API ile ilgilidir.");
  }

  if (response) {
    coinInfo.coinName = body.data.name;
    messariBool = true;
    fillTheData();
  }
}

function fillTheData() {
  let text_coinSymbol = document.getElementById("coinSymbol");
  let text_coinName = document.getElementById("coinName");
  let text_lastPrice = document.getElementById("coinLastPrice");
  let text_lastPriceWithUnit = document.getElementById("coinLastPriceWithUnit");
  let text_change24hrPrice = document.getElementById("change24hrWithlot");
  let text_change24hrPercent = document.getElementById("change24hrWithpercent");
  let text_highPrice = document.getElementById("highPrice24hr");
  let text_lowPrice = document.getElementById("lowPrice24hr");
  let title_volume24hrWithlot = document.getElementById("volume24hrWithlotTitle");
  let title_volume24hrWithCurrency = document.getElementById("volume24hrWithCurrencyTitle");
  let text_volume24hrWithlot = document.getElementById("volume24hrWithlot");
  let text_volume24hrWithCurrency = document.getElementById("volume24hrWithCurrency");
  let descriptionArticle = document.getElementById("descriptionArticle");

  text_coinSymbol.textContent = `${coinInfo.coinSymbol}/${coinInfo.currency}`;
  text_coinName.textContent = coinInfo.coinName;
  text_lastPrice.textContent = coinInfo.lastPrice;
  text_lastPriceWithUnit.textContent = `${coinInfo.lastPriceWithUnit} ${unitCharacter}`;

  if (parseFloat(coinInfo.change24hrPercent) < 0) {
    text_change24hrPrice.style.color = "red";
    text_change24hrPercent.style.color = "red";
  } else {
    text_change24hrPrice.style.color = "green";
    text_change24hrPercent.style.color = "green";
  }

  text_change24hrPrice.textContent = coinInfo.change24hrPrice;
  text_change24hrPercent.textContent = `${coinInfo.change24hrPercent}%`;
  text_highPrice.textContent = coinInfo.highPrice24hr;
  text_lowPrice.textContent = coinInfo.lowPrice24hr;
  title_volume24hrWithlot.textContent = `24S Hacim(${coinInfo.coinSymbol})`;
  text_volume24hrWithlot.textContent = coinInfo.volumeWithLot24hr;
  title_volume24hrWithCurrency.textContent = `24S Hacim(${coinInfo.currency})`;
  text_volume24hrWithCurrency.textContent = coinInfo.volumeWithCurrency24hr;
  descriptionArticle.style.fontSize = "20px";
  descriptionArticle.innerHTML = `<span id="descriptionArticle">${coinInfo.coinSymbol} coin bugünkü fiyatı: <span style="color: red">${coinInfo.lastPriceWithUnit} ${unitCharacter},</span> 24 Saatlik değişim
  <span style="color: red">${coinInfo.change24hrPercent}%,</span> 24 Saat işlem hacmi <span style="color: red">${coinInfo.volumeWithCurrency24hr} ${coinInfo.currency}</span> olarak belirlendi.</span>`;
}