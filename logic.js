/*==============================================
=       Global Variables
================================================*/


var vagaAuthKey = "9e3c9da5e3a86ef90b7a336db22e59cb";
// Trending Artists API
var trendingQuery = 'https://api.vagalume.com.br/rank.php?apikey='+vagaAuthKey+'&type=art&period=day&scope=internacional&limit=6';

var trendingWell = $("#trendingWell"); 


//albums
var albumWell = $("#albumWell");
var curBandData;

/*==============================================
=       Functions
================================================*/

// takes the JSON API for trending artists, and writes the with formatted CSS/HTML to the dom
function printTrending(response){
    console.log(response);
    //for each artist...
    for (ranked of response.art.day.internacional){
        // print it as a card to the trendingWell 
        trendingWell.append(
            $("<div/>",{class:"card trending w-full md:w-1/6 inline-flex md:block items-center text-center bg-green-200", 'data-artist':ranked.name}).append([
                $("<img/>",{src:ranked.pic_small, alt:ranked.name, class:"md:w-full sm:"}),
                $("<span/>",{text:ranked.name, class:"ml-2"}),
            ])
        );
    }
}

// run an ajax call to get the top 6 trending artists from VagaLume API, then pass this to print
function getTrending(){
    $.ajax({ 
        url:trendingQuery,
        method:"GET",
    })
    .then(function(response){
        printTrending(response);
    });
}



function printAlbums(albumArray){
    // console.log(albumArray);
    albumWell.empty();
    for(album of albumArray){
        albumWell.append(
            $("<div/>",{text:album.desc})
        );
    }
}

function getData(artist){
    $.ajax({ 
        url:"https://www.vagalume.com.br/"+artist+"/index.js",
        method:"GET",
        error:function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
                console.log("ERROR: 404");
            }
        }
    })
    .then(function(response){
        //store? this information may actually be useful later
        curBandData = response;
        console.log(curBandData);

        // print all of the albums associated with this artist
        printAlbums(response.artist.albums.item);
    });
}


/*==============================================
=      Global Variables
================================================*/

//start by immediately  showing the ternding artists
getTrending();


//add event listner to each trending buttony
$(document).on("click",".trending",function(){
    getData ($(this).attr("data-artist").toLowerCase().trim().replace(" ","-")); 
})