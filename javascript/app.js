function submitPress() {
    console.log("meow");
    var summonerNameInput = $("#search-input").val().trim();
    let accountId = null;
    let winLoss = [];
    let unixTime = [];
    let championIdArray = [];
    let championNameArray = [];
    function reset() {
        $("#fourth-part").html('<div id="lg" <h4>Last 10 Games</h4></div><br>');
    }
    reset();
    let api = "RGAPI-e80e7d25-d77d-4660-8981-d0e5593fb357"
    if (summonerNameInput) {
        fetch('https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + summonerNameInput + '?api_key=' + api)
            .then(response => response.json())
            .then(json => {
                // console.log(json);
                // if there is no ID in the json returned, then give error message"""
                if (json.id === undefined) {

                    $("#third-part").html('<h2 id = "invalid-name">' + "Invalid summoner name. Please try again." + '</h2>');
                    reset();
                    return Promise.reject("Invalid User");
                } else {
                    var name = json.name;
                    var level = json.summonerLevel;
                    var summonericon = "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + json.profileIconId + ".png"
                    $("#third-part").html('<div class = "row"><div class = "col-4" id = "summoner-img"><img src = "' + summonericon + '"><h2 id = "sl">' + level + '</h2></div><div class = "col-4"><h2 id = "sn">' + name + '</h2></div><div class="col-4" id = "killing-me"><canvas id="myChart"></canvas></div></div>');
                    accountId = json.accountId;
                }
            })
            .then(() => {
                return fetch(`https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/${accountId}?api_key=` + api)
                    .then(response => response.json())
                    .then(json => {
                        for (let z = 0; z < 10; z++) {
                            var championId = json.matches[z].champion;
                            championIdArray.push(championId);
                            var timestamp = json.matches[z].timestamp;
                            var readableTime = moment(timestamp).format("L");
                            unixTime.push(readableTime);
                            // $("#tbody").append("<tr><td>" + readableTime + "</td></tr>");
                        };

                        const matches = json.matches.slice(0, 10);
                        return Promise.all(matches.map(match => {
                            return fetch(`https://na1.api.riotgames.com/lol/match/v3/matches/${match.gameId}?api_key=` + api)
                                .then(response => response.json())
                                .then(json => {
                                    let participantId = null;
                                    let participantTeam = null;
                                    for (let j = 0; j < json.participantIdentities.length; j += 1) {
                                        if (json.participantIdentities[j].player.accountId === accountId) {
                                            participantId = json.participantIdentities[j].participantId;
                                        }
                                    }
                                    for (let k = 0; k < json.participants.length; k += 1) {
                                        if (json.participants[k].participantId === participantId) {
                                            participantTeam = json.participants[k].teamId;
                                        }
                                    }
                                    for (let l = 0; l < json.teams.length; l += 1) {
                                        if (json.teams[l].teamId === participantTeam) {
                                            winLoss.push(json.teams[l].win)
                                        }
                                    }
                                })
                        }))
                    })
            }).then(() => {
                var win = 0;
                var loss = 0;
                // console.log(unixTime);
                // console.log(championIdArray);
                fetch(
                    "https://raw.githubusercontent.com/ngryman/lol-champions/master/champions.json"
                )
                    .then(response => response.json())
                    .then(json => {
                        const championKeys = json;
                        console.log(championIdArray);

                        for (let q = 0; q < championIdArray.length; q++) {
                            console.log(q);
                            for (let p = 0; p < championKeys.length; p++) {
                                if (championKeys[p].key == championIdArray[q]) {
                                    console.log(championKeys[p].name);
                                    let champName = championKeys[p].name;
                                    championNameArray.push(champName);
                                }
                                // else if (championIdArray[q] > 267) {
                                // console.log("Unknown");
                                // championNameArray.push("Unknown");
                                // continue;
                                // }
                            }
                            // if (championIdArray[q] > 267) {
                            // // console.log("Unknown");
                            // championNameArray.push("New Champion");
                            // }
                            console.log(championNameArray);
                        }
                    })
                    .then(() => {
                        for (let y = 0; y < 10; y++) {
                            if (winLoss[y] === "Fail") {
                                winLoss[y] = "Lose";
                                $("#fourth-part").append('<div class = "row" id = "user-lost"><div class = "col-sm-4" id = "all-format">' + unixTime[y] + '</div><div class = "col-sm-4" id = "all-format">' + winLoss[y] + '</div>' + '<div class = "col-sm-4" id = "all-format">' + championNameArray[y] + '</div></div>');
                            } else {
                                $("#fourth-part").append('<div class = "row" id = "user-won"><div class = "col-sm-4" id = "all-format">' + unixTime[y] + '</div><div class = "col-sm-4" id = "all-format">' + winLoss[y] + '</div>' + '<div class = "col-sm-4" id = "all-format">' + championNameArray[y] + '</div></div>');
                            };
                        }
                        $("#fourth-part").append("<br>");
                    })



                for (let m = 0; m < winLoss.length; m++) {
                    if (winLoss[m] === "Win") {
                        win++;
                    } else {
                        loss++;
                    }
                }
                // fetch('http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json')
                // console.log("win", win);
                // console.log("loss", loss);
                var ctx = document.getElementById('myChart').getContext('2d');
                var chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'doughnut',
                    // The data for our dataset
                    data: {
                        labels: ["Wins", "Losses"],
                        datasets: [{
                            label: "My First dataset",
                            backgroundColor: ['rgb(163, 207, 236)', 'rgb(255, 99, 132)'],
                            borderColor: ['rgb(163, 207, 236)', 'rgb(255, 99, 132)'],
                            data: [win, loss],
                        }]
                    },
                    options: {
                        legend: {
                            labels: {
                                fontColor: 'white'
                            }
                        }
                    }
                });
            })
            .catch(err => {
                console.log(err);
            });
    }
};


document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('button').addEventListener('click', submitPress);
    document.addEventListener('keyup', (e) => {
        console.log("woof");
        e.preventDefault();
        if (e.keyCode === 13) {

            submitPress();
        }
    })

})