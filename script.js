(function() {
  var nextUrl = "";
  $("#submit-button").on("click", function() {
    $("#results-container").html("");
    $("#yourResults").html("");
    var userInput = $("input[name=user-input]").val();
    var albumOrArtist = $("select").val();
    var imageUrl = "default.png";
    var moreButton = $("#moreButton");
    moreButton.css({ visibility: "hidden" });

    function listResults(response) {
      var myHtml = "";
      for (var i = 0; i < response.items.length; i++) {
        var externalLink = response.items[i].external_urls.spotify;
        var name = response.items[i].name;
        if (response.items[i].images[0]) {
          imageUrl = response.items[i].images[0].url;
        }
        myHtml +=
          "<div class='artist'>" +
          "<img src='" +
          imageUrl +
          "'>" +
          "<a href='" +
          externalLink +
          "'>" +
          name +
          "</a>" +
          "</div>";
      }
      $("#results-container").append(myHtml);
    }

    function getNextUrl(next) {
      // change nextUrl variable to contain the url provided in the spotify response to show more results
      nextUrl =
        next &&
        next.replace(
          "https://api.spotify.com/v1/search",
          "https://elegant-croissant.glitch.me/spotify"
        );
    }

    $.ajax({
      url: "https://elegant-croissant.glitch.me/spotify",
      method: "GET",
      data: {
        query: userInput,
        type: albumOrArtist
      },
      success: function(response) {
        response = response.artists || response.albums;
        console.log("response is: ", response);

        // generating text to appear under the input section after a search.
        if (response.items.length > 0) {
          $("#yourResults").html(
            `<p>Your search Results For <strong>'${userInput}'</strong> by: <strong>${albumOrArtist}</strong></p>`
          );
          moreButton.css({ visibility: "visible" });
        } else {
          $("#yourResults").html(
            `No results for: <strong>'${userInput}'</strong>`
          );
          $("#results-container").html("");
          moreButton.css({ visibility: "hidden" });
        }
        if (!response.next) {
          moreButton.css({ visibility: "hidden" });
        }
        // trigger infinite scroll if window reaches the bottom of browser
        getNextUrl(response.next);
        listResults(response);
      }
      //initial success end
    });
    $("#moreButton").on("click", function() {
      $.ajax({
        url: nextUrl,
        success: function(response) {
          response = response.artists || response.albums;
          listResults(response);
          getNextUrl(response.next);
          if (!response.next) {
            moreButton.css({ visibility: "hidden" });
          }
        }
      });
    });
  });

  if (window.location.search.indexOf("scroll=infinite") != -1) {
    console.log("infinite scroll triggered");
    moreButton.css({ visibility: "hidden" });
    setTimeout(infiniteScroll, 1000);
  }

  function infiniteScroll() {
    var pageEnd =
      $(document).height() - $(window).height() <= $(window).scrollTop() + 100;
    console.log("page end:", pageEnd);
    setTimeout(function() {
      if (pageEnd) {
        $.ajax({
          url: nextUrl,
          success: function(response) {
            response = response.artists || response.albums;
            listResults(response);
            getNextUrl(response.next);
            infiniteScroll();
          }
        });
      } else {
        infiniteScroll();
      }
    }, 500);
  }
})();
