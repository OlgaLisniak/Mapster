let map;
let markers = [];
let userMarker;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: { lat: 48.468592, lng: 35.049832 }
  });

  google.maps.event.addListener(map, 'click', function(event) {
    if(userMarker) {
      userMarker.setMap(null);
    }
    userMarker = new google.maps.Marker({
      map: map,
      position: event.latLng,
      title: 'Your new story'
    });
  });
  
  $.get('/getPosition', (data, status) => {
    if (data) {
      data.forEach(function(post) {
        if (post.location.lat) {
          let marker = new google.maps.Marker({
            map: map,
            position: post.location,
            title: post.title
          });

          let infowindow = new google.maps.InfoWindow({
            content: `<span> ${post.username} </span> <br> <h4 style="margin-bottom: 0px;"> ${post.title} </h4> <br> <hr style="margin-top: 0px !important;"> <p> ${post.body} </p>`
          });
          marker.addListener('click', function() {
            infowindow.open(map, marker);
          });

          markers.push(marker);
        }
      });
    }
  });
}

function addStory() {
  if (userMarker) {
    let lat = userMarker.getPosition().lat(),
      lng = userMarker.getPosition().lng();
    // Get country
    $.get(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toFixed(6)},${lng.toFixed(6)}&sensor=true`, (data, status) => {
      if(data.status === 'OK') {
        let markerLocationInfo =  data.results[data.results.length - 2].formatted_address;
        $('#location').text(markerLocationInfo);
      }
      else {
        $('#location').text('Location not found');
      }
      $('#location-input').val(JSON.stringify({lat:lat, lng:lng}));
      $('#modal').modal('show');
    }) 
    }
    else {
      showAlert('Please choose location clicking on the map below');
    } 
}

function showAlert(message) {
  //  Check for emptiness
  if (!$('#alert-container').html()) {
    $('#alert-container').append(`<div class='alert alert-warning alert-dismissable fade in'> 
      <a href='#' class='close' data-dismiss='alert', aria-label='close'> × </a>
      <strong> Attention! </strong> 
      <span> ${message} </span></div>`);
  }
  $('html,body').animate({scrollTop: 0}, 700);
}

function showModalPostChange() {
  
}

