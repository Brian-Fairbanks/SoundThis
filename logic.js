/*==============================================
=       Global Variables
================================================*/
var landingPage = $("#landing-page");

var vagaAuthKey = "9e3c9da5e3a86ef90b7a336db22e59cb";
// Trending Artists API
var trendingQuery = 'https://api.vagalume.com.br/rank.php?apikey='+vagaAuthKey+'&type=art&period=day&scope=internacional&limit=6';

var trendingWell = $("#trendingWell"); 
var relatedWell = $("#relatedWell"); 

// Search History Vars
var artistSearch = $("#artistSearchForm");
var artistInput = $("#artistInput");
var artistHist;
var searchedArtistGroup = $("#searchWell");


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
        console.log(album);
        albumWell.append(
            $("<div/>",{text:album.desc})
        );
    }
}
function printRelated(relatedArray){
    // console.log(albumArray);
    relatedWell.empty();
    for(artist of relatedArray){
        console.log(artist);
        relatedWell.append(
            $("<div/>",{text:artist.name})
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


        //store? this information may actually be useful laterS
        curBandData = response;
        console.log(curBandData);

        // print all of the albums & related tracks associated with this artist
        printAlbums(response.artist.albums.item);
        printRelated(response.artist.related);

        //hide previous card, and display artist card
        $("#landing-page").addClass("collapsed",400, function(){
            $("#artistPage").removeClass("collapsed",400);
        });
        
    });
}


//          History Functions
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


/*==============================================
=      Main Code
================================================*/

//start by immediately  showing the ternding artists
getTrending();

$(window).on("load", function(){
    loadHist();
    printButtons();
});

artistSearchForm.on("submit", artistAdded);

$(document).on("click",".artist-btn", function(){
    artist = $(this).attr("data-artist");
    printDataForArtist(artist);
  
//add event listner to each trending buttony
$(document).on("click",".trending",function(){
    getData ($(this).attr("data-artist").toLowerCase().trim().replace(" ","-")); 
})
