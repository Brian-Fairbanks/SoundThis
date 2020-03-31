$(document).ready(function () {
    var apiKey = "codingbootcamp"
    var artist = userInput
    

    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=" + apiKey

console.log("making ajax call")
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json"
    }).then(function (response) {
        console.log(response);
        // for(similarArtist of response.similar.info.results){
        // console.log(similarArtist)}

    })
    

    

    }
);

