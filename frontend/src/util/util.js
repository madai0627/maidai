const util = {
  transformTime(time) {
    let year = new Date(time).getFullYear()
    let month = new Date(time).getMonth()+1
    let day = new Date(time).getDate()
    let Hour = new Date(time).getHours()
    let min = new Date(time).getMinutes()
    let sec = new Date(time).getSeconds()
    return `${year}-${month}-${day} ${Hour}:${min}:${sec}`
  }
}

export default util