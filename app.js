const prayertimes = document.getElementById('prayertimes')

function correctTimezone( time, differ = 5 )
{
    let t = new Date(time)
    return t
}

function getAverage( a, b )
{
    let d1 = new Date(a)
    let d2 = new Date(b)
    
    let diff = Math.abs(d1 - d2) / 1000
    
    // calculate hours
    let hours = (Math.floor(diff / 3600) % 24) / 2;
    diff -= hours * 3600;

    // calculate minutes
    let minutes = (Math.floor(diff / 60) % 60) / 2;
    diff -= minutes * 60;
    
    d1.setHours(d1.getHours() + hours)
    d1.setMinutes(d1.getMinutes() + minutes)

    return d1


}

function getTimeOnly( date )
{
    let hh = ('0' + date.getHours()).slice(-2)
    let min = ('0' + date.getMinutes()).slice(-2)
    return `${hh}:${min}`
}

function calcFajr(jsonData)
{
    let startDateTime = correctTimezone( jsonData.nautical_twilight_begin )
    let endDateTime = correctTimezone(jsonData.sunrise)
    return {
        'start': startDateTime,
        'end': endDateTime,
        'start_time' : getTimeOnly(startDateTime),
        'end_time' : getTimeOnly(endDateTime)
    }
}

function calcDuhr(jsonData)
{
    let asr = calcAsr(jsonData)
    let startDateTime = correctTimezone( jsonData.solar_noon )
    let endDateTime = asr.start
    return {
        'start': startDateTime,
        'end': endDateTime,
        'start_time' : getTimeOnly(startDateTime),
        'end_time' : getTimeOnly(endDateTime)
    }
}

function calcAsr(jsonData)
{
    let asrStart = getAverage(jsonData.solar_noon, jsonData.sunset)
    let startDateTime = asrStart
    let endDateTime = getAverage(asrStart, jsonData.sunset )
    return {
        'start': startDateTime,
        'end' : endDateTime,
        'start_time' : getTimeOnly(startDateTime),
        'end_time' : getTimeOnly(endDateTime)
    }
}

function calcMaghrib(jsonData)
{
    let isha = calcIsha(jsonData)
    let startDateTime = correctTimezone( jsonData.sunset )
    let endDateTime = isha.start
    return {
        'start': startDateTime,
        'end': endDateTime,
        'start_time' : getTimeOnly(startDateTime),
        'end_time' : getTimeOnly(endDateTime)
    }
}

function calcIsha(jsonData)
{
    let startDateTime = correctTimezone( jsonData.nautical_twilight_end )
    let endDateTime = getAverage(jsonData.nautical_twilight_begin, jsonData.sunset )
    return {
        'start': startDateTime,
        'end': endDateTime,
        'start_time' : getTimeOnly(startDateTime),
        'end_time' : getTimeOnly(endDateTime)
    }
}

async function fetchAstromony(long, lat) {

    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${long}&formatted=0`

    var astromonyInfo = await fetch(url)
        .then(response => {
            return response.json()
        })
        .then(jsonData => {

            let fajr = calcFajr(jsonData.results)
            let duhr = calcDuhr(jsonData.results)
            let asr = calcAsr(jsonData.results)
            let maghrib = calcMaghrib(jsonData.results)
            let isha = calcIsha(jsonData.results)

            prayertimes.innerHTML = `
                <table class="table table-bordered" width="50">
                    <tr>
                        <th>Fajr</th>
                        <td>${fajr.start_time}</td>
                        <td>${fajr.end_time}</td>
                    </tr>
                    <tr>
                        <th>Dhur</th>
                        <td>${duhr.start_time}</td>
                        <td>${duhr.end_time}</td>
                    </tr>
                    <tr>
                        <th>Asr</th>
                        <td>${asr.start_time}</td>
                        <td>${asr.end_time}</td>
                    </tr>
                    <tr>
                        <th>Maghrib</th>
                        <td>${maghrib.start_time}</td>
                        <td>${maghrib.end_time}</td>
                    </tr>
                    <tr>
                        <th>Isha</th>
                        <td>${isha.start_time}</td>
                        <td>${isha.end_time}</td>
                    </tr>
                </table>
            `
        
            console.log('Fajr', fajr)
            console.log('Duhr', duhr)
            console.log('Asr', asr)

        })

    
    
}



navigator.geolocation.getCurrentPosition((userPosition) => {
    
    fetchAstromony(userPosition.coords.longitude, userPosition.coords.latitude)


}, () => {
    alert("Your location is required for us to check the prayer times")
})

