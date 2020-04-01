# SoundThis
[Hosted on Github Pages](https://brian-fairbanks.github.io/SoundThis/)

This app will display as much relevant information as possible on any artists given , including show times, albums, songs, lyrics, and youTube links to sample their music.

## User Story
	As: a Music Lover
	I want: an app to show me similar artists, and show times for them
	So that I: can discover and enjoy new music


## Flow
#### When opening the app, on the landing page:
* I will be presented with a list of trending artists
	* this information comes from the Vegalume API, but has been giving problems recently
	* if the API cannot return data, then I will be presented with an error message, and the reason will be printed into the console log

* I will be presented with my past searches
	* these searches will be updated each time I search a new artist


#### If I click on an trending artist, an existing search element, or search for a new artist
* I will be presented with the information about the artist including:
	* Their Name
	* Their Discography (all albums)
	* Their tour dates (as pulled from the BandsInTown API)
	* A list of similar artists

#### From the artist page, If i click on the sound this badge in the upper right
* I will return to the landing page
