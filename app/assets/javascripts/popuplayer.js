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
    
    if (zoom > 10) {
      
      var tolerance = 0.00003;
      while (tolerance < 0.01 && zoom < 18) {
        tolerance *= 2;
        ++zoom;
      }
      var way_tolerance = tolerance * 2;
      if (way_tolerance > 0.01)
        way_tolerance = 0.01;
                
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter72?data="
          + "[timeout:5][out:popup"
          + "(\"Streets\";[highway~\"primary|secondary|tertiary|residential|unclassified\"];\"name\";)"
          + "(\"POIs\";[name][highway!~\".\"][railway!~\".\"][type!~\"route|network|associatedStreet\"][public_transport!~\".\"][route!~\"bus|ferry|railway|train|tram|trolleybus|subway|light_rail\"];\"name\";)"
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
          + ");is_in("
          + latlng.lat + "," + latlng.lng
          + "););out;"
          + "&redirect=no&template=ids.popup";
          
    } else {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter72?data="
          + "[timeout:5][out:popup"
          + "(\"Country\";[admin_level~\"[23]\"];\"name\";)"
          + "(\"Region\";[admin_level~\"[45]\"];\"name\";)"
          + "(\"Location\";[admin_level~\"[678]\"];\"name\";)"
          + "];is_in("
          + latlng.lat + "," + latlng.lng
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    }
    
    ajaxRequest.onreadystatechange = popupReturned;
    ajaxRequest.open('GET', msg, true);
    ajaxRequest.send(null);
  }
  
  var folded_content = new Array();
  var expanded_content = new Array();

  function popupReturned() {
    // if AJAX returned a list of markers, add them to the map
    if (ajaxRequest.readyState == 4) {
      //use the info here that was returned
      if (ajaxRequest.status == 200) {
        var display = "";
        if (ajaxRequest.responseText.search("strong") != -1) {
          var lines = ajaxRequest.responseText.split("\n");
          if (ajaxRequest.responseText.search("Error") != -1)
            display = "Sorry - too much details here. Please zoom in further.";
          else if (lines.length <= 64)
            display = ajaxRequest.responseText;
          else
          {
            var folded = "";
            folded_content = new Array();
            expanded_content = new Array();
            var folded_count = 0;
            for (var i = 0; i < lines.length; ++i)
            {
              if (lines[i][0] == "<" || lines[i][0] == " ")
              {
                if (lines[i].substr(0,3) == "<p>")
                {
                  ++folded_count;
                  folded_content.push("");
                  folded_content[folded_count] = "" + lines[i].substr(3, lines[i].length-8)
                      + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.expand(" + folded_count
                      + ")\">&nbsp;+&nbsp;</a>]<br/>";
                  expanded_content.push("");
                  expanded_content[folded_count] = "" + lines[i].substr(3, lines[i].length-8)
                      + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.collapse(" + folded_count
                      + ")\">&nbsp;-&nbsp;</a>]<br/>";
                  folded += "<p id=\"popup_" + folded_count + "\">" + folded_content[folded_count];
                }
                else
                  folded += lines[i];
              }
              else if (lines[i].substr(0,3) == "</p>")
              {
                ++folded_count;
                folded_content.push("");
                expanded_content.push("");
              }
              else
                expanded_content[folded_count] += lines[i];
            }
            if (folded_count <= 32)
              display = folded;
            else
              display = "Sorry - too much details here. Please zoom in further.";
          }
        } else
          display = "Sorry - no extra information available here.";
        
        popup.setLatLng(global_latlng).setContent(display).openOn(map);
      }
    }
  }
  
  return {
    'onMapClick': onMapClick,    
    'collapse': function(i) {
      document.getElementById("popup_" + i).innerHTML = folded_content[i];
    },
    'expand': function(i) {
      document.getElementById("popup_" + i).innerHTML = expanded_content[i];
    }
  }
  
}();
