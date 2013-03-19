var popupLayer = function() {

  var popup = L.popup();
  
  var popupOpen = 0;
  var recordedClicks = 0;

  var queryState = 0;

  var global_latlng = {};
  
  var folded_content = new Array();
  var expanded_content = new Array();

  var display = "";
  
  var popupEntries = new Array();

  // obtain an AJAX request object
  var ajaxRequest = function()
  {
    if (window.XMLHttpRequest)
      return new XMLHttpRequest();
    if (window.ActiveXObject)
      return new ActiveXObject("Microsoft.XMLHTTP");
    return null;
  }();
  if (ajaxRequest == null)
    alert ("This browser does not support HTTP Request");
  
  
  function onMapClick(e)
  {
    if (popupOpen == 0)
    {
      global_latlng = e.latlng;
      recordedClicks = 1;
      setTimeout(openPopup, 300);
    }
    else if (popupOpen == 3)
      map.popupClose();
  }
  
  
  function onPopupOpen(e)
  {
    popupOpen = 2;
    setTimeout( function() {
      popupOpen = 3;
    }, 500);
  }
  
  
  function onPopupClose(e)
  {
    popupOpen = 1;
    setTimeout( function() {
      popupOpen = 0;
    }, 500);
  }

  
  function onDoubleClick(e)
  {
    recordedClicks = 2;
  }
  
  
  function openPopup()
  {
    if (recordedClicks == 1)
    {
      queryState = 0;
      popup.setLatLng(global_latlng).setContent("<div id=\"popupContent\" style=\"width: 320px\">Loading data ...</div>").openOn(map);
      askForPopupContent();
    }
  }

  
  function askForPopupContent()
  {
    latlng = global_latlng;
    var zoom = map.getZoom();
    
    if (queryState == 0) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter72?data="
          + "[timeout:5][out:json];is_in("
          + latlng.lat + "," + latlng.lng
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    } else if (queryState == 1) {
      
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
          + "[timeout:5][out:json];node("
          + (Number(latlng.lat) - tolerance) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    } else if (queryState == 2) {
      
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
          + "[timeout:5][out:json];way("
          + (Number(latlng.lat) - tolerance) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    } else if (queryState == 3) {
      
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
          + "[timeout:5][out:json];rel("
          + (Number(latlng.lat) - tolerance) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    }
    
    if (queryState == 0)
    {
      popupLayer.popupEntries = new Array();
      display = "";
    }
    if (queryState <= 3)
    {
      ajaxRequest.onreadystatechange = popupReturned;
      ajaxRequest.open('GET', msg, true);
      ajaxRequest.send(null);
    }
  }
  
  
  function addContent(content)
  {
    popupEntries = popupLayer.popupEntries;
    if (popupEntries.length <= 7)
      display += content;
    else if (popupEntries.length == 8)
      display += "<p>page [<strong>&nbsp;1&nbsp;</strong>]"
          + " [<a href=\"#\" onclick=\"popupLayer.showContentPage(1)\">&nbsp;2&nbsp;</a>]</p>";
    else if (popupEntries.length % 7 == 1)
    {
      display = display.substr(0, display.length - 4)
          + " [<a href=\"#\" onclick=\"popupLayer.showContentPage(" + (Math.floor(popupEntries.length/7)) + ")\">&nbsp;" + (Math.floor(popupEntries.length/7) + 1) + "&nbsp;</a>]";
      if (popupEntries.length % 70 == 64)
        display += "<br/>";
      display += "</p>";
    }
  }
  
  
  function showContentPage(index)
  {
    popupEntries = popupLayer.popupEntries;
    display = "";
    for (var i = index*7; i < index*7 + 7 && i < popupEntries.length; ++i)
      display += popupLayer.popupEntries[i].show();
    
    display += "<p>page";
    for (var j = 0; j < popupEntries.length/7; ++j)
    {
      if (j == index)
        display += " [<strong>&nbsp;" + (j + 1) + "&nbsp;</strong>]";
      else
        display += " [<a href=\"#\" onclick=\"popupLayer.showContentPage(" + j + ")\">&nbsp;" + (j + 1) + "&nbsp;</a>]";
      if (j % 10 == 9)
        display += "<br/>";
    }
    display += "</p>";
    if (queryState < 3)
      document.getElementById("popupContent").innerHTML = display + "<p><em>Searching for more ...</em></p>";
    else
      document.getElementById("popupContent").innerHTML = display;
//     popup.setContent(display).openOn(map);
  }
  
  
  function classifyElement(element)
  {
    if (!element.tags)
      return "Object without tags";
    tags = element.tags;

    if (tags.highway)
    {
      if (tags.highway == "motorway" || tags.highway == "motorway_link")
        return "Motorway";
      if (tags.motorroad && tags.motorroad == "yes")
        return "Motorroad";
      if (tags.highway == "trunk" || tags.highway == "trunk_link"
          || tags.highway == "primary" || tags.highway == "primary_link"
          || tags.highway == "secondary" || tags.highway == "secondary_link"
          || tags.highway == "tertiary" || tags.highway == "tertiary_link"
          || tags.highway == "residential"
          || tags.highway == "service"
          || tags.highway == "living_street"
          || tags.highway == "unclassified")
        return "Street";
      if (tags.highway == "footway" || tags.highway == "pedestrian" || tags.highway == "path")
        return "Footway";
      if (tags.highway == "cycleway")
        return "Cycleway";
      if (tags.highway == "track")
        return "Track";
      if (tags.highway == "steps")
        return "Steps";
      if (tags.highway == "construction")
        return "Construction site";
      if (tags.highway == "bus_stop")
        return "Bus stop";
    }
    if (tags.amenity)
    {
      if (tags.amenity == "school")
        return "School";
      if (tags.amenity == "parking")
        return "Parking";
      if (tags.amenity == "place_of_worship")
        return "Place of worship";
      if (tags.amenity == "restaurant")
        return "Restaurant";
      if (tags.amenity == "fuel")
        return "Gas station";
      if (tags.amenity == "post_box")
        return "Post box";
      if (tags.amenity == "bank")
        return "Bank";
      if (tags.amenity == "fast_food")
        return "Fast food restaurant";
      if (tags.amenity == "grave_yard")
        return "Grave yard";
      if (tags.amenity == "cafe")
        return "Café";
      if (tags.amenity == "kindergarten")
        return "Kindergarten";
      if (tags.amenity == "university")
        return "University";
      if (tags.amenity == "hospital")
        return "Hospital";
      if (tags.amenity == "post_office")
        return "Post office";
      if (tags.amenity == "pub")
        return "Pub";
    }
    if (tags.historic)
    {
      if (tags.historic == "monument")
        return "Monument";
    }
    if (tags.natural)
    {
      if (tags.natural == "water")
        return "Water";
    }
    if (tags.tourism)
    {
      if (tags.tourism == "hotel")
        return "Hotel";
      if (tags.tourism == "museum")
        return "Museum";
      if (tags.tourism == "information")
        return "Tourist information";
      if (tags.tourism == "viewpoint")
        return "Viewpoint";
    }
    if (tags.leisure)
    {
      if (tags.leisure == "pitch")
        return "Sports pitch";
      if (tags.leisure == "track")
        return "Sports track";
      if (tags.leisure == "sports_centre")
        return "Sports centre";
      if (tags.leisure == "swimming_pool" || tags.leisure == "water_park")
        return "Swimming pool";
      if (tags.leisure == "garden" || tags.leisure == "park")
        return "Leisure park";
      if (tags.leisure == "playground")
        return "Playground";
    }
    if (tags.shop)
    {
      if (tags.shop == "supermarket")
        return "Supermarket";
      if (tags.shop == "chemist")
        return "Chemist";
    }
    if (tags.waterway)
    {
      if (tags.waterway == "stream")
        return "Stream";
      if (tags.waterway == "river")
        return "River";
    }
    if (tags.railway)
    {
      if (tags.railway == "tram_stop")
        return "Tram stop";
    }
    if (tags.public_transport)
    {
      if (tags.public_transport == "stop_position" || tags.public_transport == "platform"
          || tags.public_transport == "stop_area" || tags.public_transport == "stop_area_group")
        return "Public transport stop";
    }
    if (tags.landuse)
    {
      if (tags.landuse == "forest")
        return "Forest";
      if (tags.landuse == "cemetery")
        return "Grave yard";
      if (tags.landuse == "meadow")
        return "Meadow";
      if (tags.landuse == "farm")
        return "Farm";
      if (tags.landuse == "residential")
        return "Residential area";
      if (tags.landuse == "industrial")
        return "Industrial area";
      if (tags.landuse == "commercial")
        return "Commercial area";
    }
    if (tags.route)
    {
      if (tags.route == "train")
        return "Train route";
      if (tags.route == "subway" || tags.route == "tram")
        return "Metro route";
      if (tags.route == "bus")
        return "Bus route";
      if (tags.route == "road")
        return "Road number";
      if (tags.route == "detour")
        return "Detour";
      if (tags.route == "hiking" || tags.route == "foot")
        return "Walking route";
      if (tags.route == "bicycle")
        return "Cycling route";
      if (tags.route == "ferry")
        return "Ferry route";
      if (tags.route == "power")
        return "Power line";
    }
    if (tags.type)
    {
      if (tags.type == "associatedStreet")
        return "Associated street";
      if (tags.type == "multipolygon" || tags.type == "site" || tags.type == "relatedBuilding")
        return "Real estate";
    }
    if (tags.admin_level)
    {
      if (tags.admin_level == "8" || tags.admin_level == "9"
          || tags.admin_level == "10" || tags.admin_level == "11")
        return "Suburb boundary";
      if (tags.admin_level == "5" || tags.admin_level == "6" || tags.admin_level == "7")
        return "City boundary";
      if (tags.admin_level == "3" || tags.admin_level == "4")
        return "State boundary";
      if (tags.admin_level == "2")
        return "Country boundary";
    }    
    if (element.tags.boundary == "administrative")
      return "Administrative boundary";

    return "Other object";
  }
    
  
  function linkDetector(tags)
  {
    var links = "";
    if (tags.wikipedia)
      links += "&nbsp;[<a href=\"http://en.wikipedia.org/wiki/" + tags.wikipedia + "\" target=\"_blank\">&nbsp;Wikipedia&nbsp;</a>]";
    if (tags.url)
    {
      if (tags.url.substr(0, 4) == "http")
        links += "&nbsp;[<a href=\"" + tags.url + "\" target=\"_blank\">&nbsp;url&nbsp;</a>]";
      else
        links += "&nbsp;[<a href=\"http://" + tags.url + "\" target=\"_blank\">&nbsp;url&nbsp;</a>]";
    }
    if (tags.website)
    {
      if (tags.website.substr(0, 4) == "http")
        links += "&nbsp;[<a href=\"" + tags.website + "\" target=\"_blank\">&nbsp;website&nbsp;</a>]";
      else
        links += "&nbsp;[<a href=\"http://" + tags.website + "\" target=\"_blank\">&nbsp;website&nbsp;</a>]";
    }
    
    if (links == "")
      return "";
    else
      return "<br/>" + links;
  }
  
  
  function addressDetector(tags)
  {
    var address = "";
    if (tags["addr:housename"])
      address += " " + tags["addr:housename"] + ",";
    if (tags["addr:housenumber"])
      address += " " + tags["addr:housenumber"];
    if (tags["addr:street"])
      address += " " + tags["addr:street"] + ",";
    if (tags["addr:postcode"])
      address += " " + tags["addr:postcode"];
    if (tags["addr:city"])
      address += " " + tags["addr:city"];

    if (tags["addr:full"])
      address += " " + tags["addr:full"];
    
    if (address == "")
      return "";
    else
      return "<br/><em>address:</em>" + address + "";
  }
  
  
  function newPopupEntry(element, index)
  {
    if (!element.tags)
      return {};
    
    var name = "";
    if (element.tags.name)
      name = element.tags.name;
    else if (element.tags.ref)
      name = element.tags.ref;
    else if (element.tags.operator)
      name = element.tags.operator;
    else
      return {};
    
    var class_ = classifyElement(element);
    
    return {
      'element': element,
      'class_': class_,
      'index': index,
      'name': name,
      
      'headline': function()
      {
        return "<em>" + class_ + "</em><br/>"
          + "<strong>" + this.name + "</strong>"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showDetails()\">&nbsp;details&nbsp;</a>]"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showTags()\">&nbsp;tags&nbsp;</a>]";
      },
      
      'details': function()
      {
        var result = "<em>" + class_ + "</em><br/>"
          + "<strong>" + this.name + "</strong>"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showHeadline()\">&nbsp;brief&nbsp;</a>]"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showTags()\">&nbsp;tags&nbsp;</a>]";
        var added = "";
        added += linkDetector(this.element.tags);
        added += addressDetector(this.element.tags);
        if (added == "")
          return result + "<br/>no meaningful tags found";
        else
          return result + added;
      },
      
      'tags': function()
      {
        var result = "<em>" + class_ + "</em><br/>"
          + "<strong>" + this.name + "</strong>"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showHeadline()\">&nbsp;brief&nbsp;</a>]"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showDetails()\">&nbsp;details&nbsp;</a>]";
        for (key in element.tags)
          result += "<br/><em>" + key + "</em>: " + element.tags[key];
        return result;
      },
      
      'show': function()
      {
        return "<p id=\"popupEntry_" + index + "\">" + this.headline() + "</p>";
      },
      
      'showHeadline': function()
      {
        document.getElementById("popupEntry_" + index).innerHTML = this.headline();
      },
      
      'showDetails': function()
      {
        document.getElementById("popupEntry_" + index).innerHTML = this.details();
      },
      
      'showTags': function()
      {
        document.getElementById("popupEntry_" + index).innerHTML = this.tags();
      }
    }
  }
  
  
  function popupReturned()
  {
    // if AJAX returned a list of markers, add them to the map
    if (ajaxRequest.readyState == 4) {
      //use the info here that was returned
      if (ajaxRequest.status == 200)
      {
        if (ajaxRequest.responseText.search("timestamp_osm_base") != -1)
        {
          var response = jQuery.parseJSON(ajaxRequest.responseText);
          if (response.elements)
          {
            var popupEntries = popupLayer.popupEntries;
            for (var i = 0; i < response.elements.length; ++i)
            {
              var entry = newPopupEntry(response.elements[i], popupEntries.length);
              if (entry.show)
              {
                popupEntries.push(entry);
                popupLayer.addContent(entry.show());
              }
            }
          }
        }
        else
          display = "Sorry - no extra information available here.";
        
        if (queryState < 3)
        {
          document.getElementById("popupContent").innerHTML = display + "<p><em>Searching for more ...</em></p>";
//           popup.setLatLng(global_latlng).setContent(display + "<p><em>Searching for more ...</em></p>").openOn(map);
          ++queryState;
          popupLayer.askForPopupContent();
        }
        else
          document.getElementById("popupContent").innerHTML = display;
//           popup.setLatLng(global_latlng).setContent(display).openOn(map);
      }
    }
  }
  
  
  return {
    'onMapClick': onMapClick,
    'onDoubleClick': onDoubleClick,
    'onPopupClose': onPopupClose,
    'onPopupOpen': onPopupOpen,
    'showContentPage': showContentPage,
    'askForPopupContent': askForPopupContent,
    'addContent': addContent,
    'collapse': function(i) {
      document.getElementById("popup_" + i).innerHTML = folded_content[i];
    },
    'expand': function(i) {
      document.getElementById("popup_" + i).innerHTML = expanded_content[i];
    },
    'popupEntries': popupEntries
  }
  
}();
