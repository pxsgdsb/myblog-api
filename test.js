
console.log(getDateTime(1630305785));

function getLocalTime(nS) {     
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');     
 }

function getDateTime(value) {
    let time = new Date(value*1000);
    let year = time.getFullYear()+'/';
    let month = (time.getMonth()+1);
    let date = time.getDate();
    let hour = time.getHours();
    let minute = time.getMinutes();
    let second = time.getSeconds();
    month = month < 10 ? '0'+ month +'/' : month +'/';
    date = date < 10 ? '0'+ date : date;
    hour = hour < 10 ? '0'+ hour + ":" : hour + ":";
    minute = minute < 10 ? '0'+ minute : minute + ":";
    second = second < 10 ? '0'+ second : second;
    let str = String(year)+String(month)+String(date)+ ' ' + String(hour) + String(minute) + String(second);
    return str;
}
