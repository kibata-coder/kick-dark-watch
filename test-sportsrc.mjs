const apiKey = "021d58f764adc54a498a32e1d8cc6606";
fetch("https://api.sportsrc.org/?data=matches&category=tennis", {
  headers: { "X-API-KEY": apiKey }
}).then(res => {
  console.log("Status:", res.status);
  return res.text();
}).then(text => {
  console.log("Response:", text.substring(0, 500));
}).catch(console.error);
