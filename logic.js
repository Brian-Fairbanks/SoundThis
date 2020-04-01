function getData(artist){
    $.ajax({ 
        url:"https://www.vagalume.com.br/u2/index.js",
        method:"GET",
        error:function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
                console.log("ERROR: 404");
            }
        }
    })
    .then(function(response){
        console.log(response);
    });
}


// Trending Artists API
var authKey = "9e3c9da5e3a86ef90b7a336db22e59cb";
var trendingQuery = 'https://api.vagalume.com.br/rank.php?apikey='+authKey+'&type=art&period=day&scope=internacional&limit=6';

var trendingWell = $("#trendingWell"); 

function printTrending(response){
    console.log(response);
    for (ranked of response.art.day.internacional){
        console.log(ranked.name);
        console.log(ranked.pic_small);

        trendingWell.append(
            $("<div/>",{class:"card w-full md:w-1/6 inline-flex md:block items-center text-center bg-green-200"}).append([
                $("<img/>",{src:ranked.pic_small, alt:ranked.name, class:"md:w-full sm:"}),
                $("<span/>",{text:ranked.name, class:"ml-2"}),
            ])
        );
    }
}


function getTrending(){
    $.ajax({ 
        url:trendingQuery,
        method:"GET",
    })
    .then(function(response){
        printTrending(response);
    });
}

getTrending();



var artistSearch = $("#artistSearchForm");
var artistInput = $("#artistInput");
var artistHist;
var searchedArtistGroup = $("#searchWell");

function printButtons(){

    searchedArtistGroup.empty();

    for(artist of artistHist){
        searchedArtistGroup.prepend( $("<btn>",{class:"btn btn-primary text-light", 'data-artist':artist, text:artist}) )
    }
    saveHist();
}



function saveHist(){
    localStorage.setItem('history',JSON.stringify(artistHist));
}

function loadHist(){
    artistHist = JSON.parse(localStorage.getItem('history'));
    if(artistHist === null){
        artistHist = [];
    }
}

function artistAdded(event){
    event.preventDefault();
    newArtist = artistInput.val().toLowerCase().trim();

    if(artistHist.indexOf(newArtist) < 0){
        artistHist.push(newArtist)
    }
    else{
        printDataForArtist(newArtist);
        return;
    }

    artistInput.val("");

    printDataForArtist(newArtist);

    printButtons();
}

$(window).on("load", function(){
    loadHist();
    printButtons();
});

artistSearchForm.on("submit", artistAdded);

$(document).on("click",".artist-btn", function(){
    artist = $(this).attr("data-artist");
    printDataForArtist(artist);
})