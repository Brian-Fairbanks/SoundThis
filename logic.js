/*==============================================
=       Global Variables
================================================*/
var landingPage = $("#landing-page");
var artistPage = $("#artistPage");

var vagaAuthKey = "9e3c9da5e3a86ef90b7a336db22e59cb";
var lastfmAuthKey = "5df3eb015b42d401ebf833e6895a745f";
// Trending Artists API
var trendingQuery = 'https://api.vagalume.com.br/rank.php?apikey=' + vagaAuthKey + '&type=art&period=day&scope=internacional&limit=6';
var limit = 6;
var trendingQueryLFM = 'https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=' + lastfmAuthKey + '&limit=' + limit + '&format=json'
var getArtistLFM = 'https://ws.audioscrobbler.com/2.0/?api_key=' + lastfmAuthKey + '&format=json&method=artist.getinfo&artist=';

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
var activeAlbum;

//EVENTS
var eventWell = $("#eventWell")
// Repeated tailwind Styles
var artistBtnStyles = "artist-btn w-full md:w-1/2 lg:w-1/4 xl:w-1/6 inline-flex md:block items-center text-center bg-green-200 p-1 text-lg capitalize hover:bg-green-500 cursor-pointer";

/*==============================================
=       Functions
================================================*/

/* = Trending Tab Functions
========================================================*/

function eachTrending(artist, pArtist) {
    $.ajax({
        //url: trendingQuery,       //vagalume method depreciated.
        url: "https://www.vagalume.com.br/" + pArtist + "/index.js",
        method: "GET",
    })
        .fail(function (xhr, ajaxOptions, thrownError) {
            console.log("Trending Error: " + JSON.stringify(xhr));
            trendingWell.empty().append($("<div/>", { text: artist + " is trending, but something went wrong!", class: "text-center bg-green-200 text-xl w-full p-3" }));
        })
        .done(function (response) {
            $("#" + pArtist).append([
                $("<img/>", { src: "https://www.vagalume.com.br" + response.artist.pic_medium, alt: artist, class: "h-24 w-24 md:w-full md:h-auto" }),
                $("<span/>", { text: artist, class: "ml-2" })
            ]);
        });
}


// takes the JSON API for trending artists, and writes the with formatted CSS/HTML to the dom
function printAllTrending(response) {
    //console.log(response);
    trendingWell.empty();
    //for each artist...
    //for (ranked of response.art.day.internacional) {      // vagalume method depreciated
    for (ranked of response.artists.artist) {
        var formatedName = ranked.name.toLowerCase().replace(/[^A-Z0-9]/ig, "-");
        // print it as a card to the trendingWell 
        trendingWell.append(
            $("<div/>", { class: "card artist-btn trending w-full md:w-1/6 inline-flex md:block items-center text-center bg-green-200 hover:bg-green-500 cursor-pointer", 'data-artist': ranked.name, 'id': formatedName })
        )
        //console.log(ranked.name.replace(/[^A-Z0-9]/ig, "_"));
        eachTrending(ranked.name, formatedName);
    }
}

// run an ajax call to get the top 6 trending artists from VagaLume API, then pass this to print

function getTrending() {
    $.ajax({
        //url: trendingQuery,       //vagalume method depreciated.
        url: trendingQueryLFM,
        method: "GET",
    })
        .fail(function (xhr, ajaxOptions, thrownError) {
            console.log("Trending Error: " + JSON.stringify(xhr));
            trendingWell.empty().append($("<div/>", { text: "I'm sorry, but there has been an error pulling todays trending artists", class: "text-center bg-green-200 text-xl w-full p-3" }));
        })
        .done(function (response) {
            printAllTrending(response);
        });
}

/* = Artist Page Functions  (album printing portion down under musicBrainz functions)
========================================================*/

function printRelated(relatedArray) {
    // console.log(albumArray);
    relatedWell.empty();
    for (artist of relatedArray) {
        //console.log(artist);
        relatedWell.append(
            $("<div/>", { text: artist.name, class: artistBtnStyles, 'data-artist': artist.name })
        );
    }
}

function printHeader(response) {
    //replace the artist name
    $("#artistBannerName").text(response.artist.desc);

    // clear the genre well, and add all the new artists genres
    $("#genreWell").empty();
    for (genre of response.artist.genre) {
        $("#genreWell").append($("<div/>", { text: genre.name, class: "inline-block bg-teal-700 m-1 px-2 text-sm rounded" }))
    }

    // replace the source for the artists picture
    $("#artistBannerPic").attr({ 'src': "https://www.vagalume.com.br" + response.artist.pic_medium, 'alt': response.artist.desc + " picture: from vagalume" });
    //set the vagaLink to the current url
    $("#vagaLink").attr("href", "https://www.vagalume.com.br/" + response.artist.url)
}



function getData(artist) {
    $.ajax({
        url: "https://www.vagalume.com.br/" + artist.split(" ").join("-") + "/index.js",
        method: "GET",
        error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status == 404) {
                console.log("ERROR: 404");
                return;
            }
        }
    })
        .done(function (response) {

            // print all of the albums & related tracks associated with this artist
            printHeader(response);
            getMusicBrainzAlbums(response.artist.desc);
            printRelated(response.artist.related);
            bandsintown(artist.split(/[ -]/).join("+"));


            //hide previous card, and display artist card
            landingPage.addClass("collapsed", 300, function () {
                artistPage.removeClass("collapsed", 300);
            });

        });
}


/* = Search History Functions
========================================================*/
function printButtons() {

    searchedArtistGroup.empty();

    for (artist of artistHist) {
        searchedArtistGroup.prepend($("<div/>", { class: artistBtnStyles, 'data-artist': artist, text: artist }))
    }
    saveHist();
}



function saveHist() {
    localStorage.setItem('history', JSON.stringify(artistHist));
}

function loadHist() {
    artistHist = JSON.parse(localStorage.getItem('history'));
    if (artistHist === null) {
        artistHist = [];
    }
}

function artistAdded(event) {
    event.preventDefault();
    newArtist = artistInput.val().toLowerCase().trim();

    if (artistHist.indexOf(newArtist) < 0) {
        artistHist.push(newArtist)
    }
    else {
        getData(newArtist);
        return;
    }

    artistInput.val("");

    getData(newArtist);

    printButtons();
}
//

// //

//

/* = BandsInTown Functions
========================================================*/
function bandsintown(artist) {
    var apiKey = "e2e8d997dbfc78f64d2429abef0e6949"
    var eventURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + apiKey
    var artistURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=" + apiKey

    //console.log("making ajax call")
    $.ajax({
        url: artistURL,
        method: "GET",
        dataType: "json"
    }).then(function (response) {
        //console.log(response);


    })
    //console.log("making ajax call")
    $.ajax({
        url: eventURL,
        method: "GET",
        dataType: "json"
    }).then(function (response) {
        //console.log(response)

        printEvents(response);
    })
}

function printEvents(response) {
    eventWell.empty();
    //console.log(response.datetime)

    if (response.length == 0) {
        $(eventWell).empty().append($("<div/>", { text: "Sorry, but there are no events at this time", class: "text-center bg-green-200 text-xl w-full p-3" }));
        return;
    }


    for (const showing of response) {
        var dates = moment(showing.datetime)
        var venue = showing.venue.name
        var city = showing.venue.city
        var state = showing.venue.region

        eventWell.append(
            $("<div/>", { class: "card w-full text-center bg-green-200 flex mb-1" }).append([

                $("<span/>", { text: dates.format("MMM Do YYYY"), class: "w-1/4" }),
                $("<span/>", { text: venue, class: "w-1/4" }),
                $("<span/>", { text: city, class: "w-1/4" }),
                $("<span/>", { text: state, class: "w-1/4" })
            ])
        );
    }

}
// =  Music Brainz Functions
//================================================


function sortByKeyAsc(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

//a bit of a misnomer - get the associated ArtistID from MusicBrainz and chain the process to get all albums
function getMusicBrainzAlbums(artist) {
    $.ajax({
        url: "https://musicbrainz.org/ws/2/artist/?query=" + artist + "&fmt=json",
        method: "GET"
    })
        .fail(function (response) {
            console.log("Data nof found for " + artist);
        })
        .done(function (response) {
            //console.log(response);
            // response should be a search of all artists, groups, and songs with the name
            artistID = response.artists[0].id
            console.log(artistID);
            // artist is found, clear the well for printing
            albumWell.empty();
            getChunk(artistID, 0);
        })
}

function getChunk(artistId, curoffset) {
    //breaking down the construction of a particularly long url query...
    var queryURL = "https://musicbrainz.org/ws/2/release-group?";
    queryURL += "artist=" + artistID;
    queryURL += "&offset=" + curoffset;
    queryURL += "&fmt=json";

    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .fail(function () {
            console.log("Data not found for " + artistID);
        })
        .done(function (response) {
            console.log(response);
            getAlbums(response);
            if (curoffset < response['release-group-count']) {
                getChunk(artistID, curoffset += 25);
            }
        })
}

function getAlbums(response) {
    //sortByKeyAsc(response['release-groups'], "first-release-date")
    for (album of response['release-groups']) {
        console.log(album)
        albumWell.append(
            $("<div/>", { class: " w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 album-btn", albumID: album.id  }).append(
                $("<div/>", {
                    class: "shadow-lg sm:rounded bg-green-200 sm:border border-gray-500 p-0 m-0 sm:m-2 h-full"
                    + "sm:h-auto w-full sm:w-5/6 md:w-auto inline-flex md:block items-center text-center"
                    + " hover:bg-green-600 object-scale-down"
                }).append([
                    $("<img/>", { src: 'http://via.placeholder.com/200x200', alt: album.title, id: "img" + album.id, class: "h-24 w-24 md:w-64 md:h-64" }),
                    $("<div/>", { class: "w-full sm:pl-2 " }).append(
                        [
                            $("<div/>", { text: album.title, class: "font-bold text-lg mb-2" }),
                            $("<div/>", { text: moment(album['first-release-date'], "YYYY-MM-DD").format("MMM Do YYYY"), class: "w-full" })
                        ]
                    ),
                    $("<div/>", { class: "tracks collapsed w-full" })
                ])
            )
        );
        getAlbumArtwork(album.id)
    }
}

function getAlbumArtwork(albumID) {
    $.ajax({
        url: "http://coverartarchive.org/release-group/" + albumID + "/",
        method: "GET"
    })
        .fail(function () {
            console.log("Image not found for album " + albumID);
        })
        .done(function (response) {
            $("#img" + albumID).attr("src", response.images[0].thumbnails.small);
        })
}


function hideAlbum(album){
    if(album == undefined){return};
    album.removeClass("activeAlbum");
    album.find(".tracks").addClass("collapsed",200)
}

function showAlbum(albumID, albumDiv){
    //slapped together method of handling this.  If the album list is expanded, then no need to do anything.  you must already be viewing
    if(! albumDiv.find(".tracks").hasClass( "collapsed" )){ return;}
    hideAlbum(activeAlbum);

    albumDiv.addClass("activeAlbum");
    albumDiv.find(".tracks").removeClass("collapsed");
    activeAlbum = albumDiv;
    if (albumDiv.find(".tracks").html() != ""){
        return;
    }
    getAlbumReleases(albumID, albumDiv);

}


//  =====  Album Tracks

function getAlbumReleases(releaseGroup, albumDiv){
    //albumDiv.append( $("<div>", {text:releaseGroup}));

    $.ajax({
        url: "https://musicbrainz.org/ws/2/release-group/"+releaseGroup+"?inc=aliases+releases&fmt=json",
        method: "GET"
    })
        .fail(function (response) {
            console.log("Data not found for release-group " + releaseGroup);
        })
        .done(function (response) {
            //console.log(response);
            var albumID = response.releases[0].id;
            //console.log(albumID);
//            albumDiv.append( $("<div>", {text:releaseGroup}));
            getAlbumInfo(albumID, albumDiv);

        })
}

//a bit of a misnomer - get the associated ArtistID from MusicBrainz and chain the process to get all albums
function getAlbumInfo(albumID, albumDiv) {
    $.ajax({
        url: "https://musicbrainz.org/ws/2/release/"+albumID+"?inc=aliases+labels+recordings&fmt=json",
        method: "GET"
    })
        .fail(function (response) {
            console.log("Data not found for albumID" + albumID);
        })
        .done(function (response) {
            console.log(response);
            for(track of response.media[0].tracks){
                albumDiv.find(".tracks").append( $("<div>", {text:track.title}));
            }
        })
}

/*==============================================
=      Main Code
================================================*/

//start by immediately showing the trending artists
getTrending();

$(window).on("load", function () {
    loadHist();
    printButtons();
});

artistSearch.on("submit", artistAdded);

// add link for all artist buttons
$(document).on("click", ".artist-btn", function () {
    getData($(this).attr("data-artist").toLowerCase().trim().split(" ").join("-"));
});

// add link for all album buttons
$(document).on("click", ".album-btn", function () {
    showAlbum($(this).attr("albumID"), $(this));
});

//Clear Searched Artists History
$("#HistoryClear").on("click", function () {
    //alert("Test!");
    artistHist = [];
    printButtons();
});


//Clicking Logo will Take you back to Landing Page
$("#homepage-btn").on("click", function () {
    // alert("test");
    artistPage.addClass("collapsed", 300, function () {
        landingPage.removeClass("collapsed", 300);
    })
});
