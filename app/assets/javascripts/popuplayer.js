var popupLayer = function() {

  var popup = L.popup();
  
  function onMapClick(e) {
    askForPopupContent(e.latlng);
    popup.setLatLng(e.latlng).setContent("Loading data ...").openOn(map);
  }

  // obtain an AJAX request object
  var ajaxRequest = getXmlHttpObject();
  if (ajaxRequest == null)
    alert ("This browser does not support HTTP Request");

  function getXmlHttpObject() {
    if (window.XMLHttpRequest) { return new XMLHttpRequest(); }
    if (window.ActiveXObject)  { return new ActiveXObject("Microsoft.XMLHTTP"); }
    return null;
  }
                
  var global_latlng = {};
                
  function askForPopupContent(latlng) {
    global_latlng = latlng;
    var zoom = map.getZoom();
    var tolerance = 0.00003;
    while (tolerance < 0.01 && zoom < 18) {
      tolerance *= 2;
      ++zoom;
    }
    var way_tolerance = tolerance * 3;
    if (way_tolerance > 0.01)
      way_tolerance = 0.01;
                
    // request the marker info with AJAX for the current bounds
    var msg = "http://overpass-api.de/api/interpreter?data="
        + "[timeout:3][out:popup"
        + "(\"Streets\";[highway~\"primary|secondary|tertiary|residential|unclassified\"];\"name\";)"
        + "(\"POIs\";[name][highway!~\".\"][railway!~\".\"][landuse!~\".\"][type!~\"route|network|associatedStreet\"][public_transport!~\".\"][route!~\"bus|ferry|railway|train|tram|trolleybus|subway|light_rail\"];\"name\";)"
        + "(\"Public Transport Stops\";[name][highway~\"bus_stop|tram_stop\"];[name][railway~\"halt|station|tram_stop\"];\"name\";)"
        + "];(node("
        + (Number(latlng.lat) - tolerance) + ","
        + (Number(latlng.lng) - tolerance) + ","
        + (Number(latlng.lat) + tolerance) + ","
        + (Number(latlng.lng) + tolerance)
        + ");way("
        + (Number(latlng.lat) - way_tolerance) + ","
        + (Number(latlng.lng) - way_tolerance) + ","
        + (Number(latlng.lat) + way_tolerance) + ","
        + (Number(latlng.lng) + way_tolerance)
        + "););(._;<;);out;"
        + "&redirect=no&template=ids.popup";
    ajaxRequest.onreadystatechange = popupReturned;
    ajaxRequest.open('GET', msg, true);
    ajaxRequest.send(null);
  }

  function popupReturned() {
    // if AJAX returned a list of markers, add them to the map
    if (ajaxRequest.readyState == 4) {
      //use the info here that was returned
      if (ajaxRequest.status == 200) {
        var display = "";
        if (ajaxRequest.responseText.search("strong") != -1) {
          var lines = ajaxRequest.responseText.match(/\n/g);
          if (lines.length <= 64)
            display = ajaxRequest.responseText;
          else
            display = "Sorry - too much details here. Please zoom in further.";
        } else
          display = "Sorry - no extra information available here.";
        
        popup.setLatLng(global_latlng).setContent(display).openOn(map);
      }
    }
  }
  
  return {
    'onMapClick': onMapClick
  }
  
}();
