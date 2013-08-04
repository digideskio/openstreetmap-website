var popupLayer = function() {

  var boundsLayer = L.rectangle([[0, 0], [0, 0]], {color: "#0000ff", weight: 1});
  var tolerance = 0;
  var latScale = 1;
  
  var popup = L.popup();
  
  var popupOpen = 0;
  var recordedClicks = 0;

  var queryState = 0;

  var global_latlng = {};
  
  var folded_content = new Array();
  var expanded_content = new Array();

  var display = "";
  var currentPage = 0;
  
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
    if (map.hasLayer(boundsLayer))
      map.removeLayer(boundsLayer);
    popupOpen = 1;
    setTimeout( function() {
      popupOpen = 0;
    }, 500);
  }

  
  function onDoubleClick(e)
  {
    recordedClicks = 2;
  }
  
  
  function calculateCoordTolerance(zoom)
  {
    var i = zoom;
    var tolerance = 0.0001;
    while (i < 18) {
      tolerance *= 2;
      ++i;
    }
    if (tolerance > 0.005)
      tolerance = 0.005;
    return tolerance;
  }

  
  function openPopup()
  {
    if (recordedClicks == 1)
    {
      queryState = 0;
      popup.setLatLng(global_latlng).setContent("<div id=\"popupContent\" style=\"width: 320px\">Loading data ...</div>").openOn(map);
      
      latlng = global_latlng;
      tolerance = calculateCoordTolerance(map.getZoom());
      latScale = Math.cos(latlng.lat / 180.0 * Math.PI);
      
      boundsLayer.setBounds(
          [[Number(latlng.lat) - tolerance * latScale,Number(latlng.lng) - tolerance],
           [Number(latlng.lat) + tolerance * latScale,Number(latlng.lng) + tolerance]]);
      boundsLayer.addTo(map);
      
      currentPage = 0;
      askForPopupContent();
    }
  }
  
  
  function askForPopupContent()
  {
    latlng = global_latlng;
    
    if (queryState == 0) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter?data="
          + "[timeout:5][out:json];node("
          + (Number(latlng.lat) - tolerance * latScale) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance * latScale) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    } else if (queryState == 1) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter?data="
          + "[timeout:5][out:json];way("
          + (Number(latlng.lat) - tolerance * latScale) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance * latScale) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    } else if (queryState == 2) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter?data="
          + "[timeout:5][out:json];rel("
          + (Number(latlng.lat) - tolerance * latScale) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance * latScale) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;"
          + "&redirect=no&template=ids.popup";
          
    } else if (queryState == 3) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter?data="
          + "[timeout:5][out:json];is_in("
          + latlng.lat + "," + latlng.lng
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
    currentPage = index;
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
        links += "&nbsp;[<a href=\"" + tags.url + "\" target=\"_blank\" rel=\"nofollow\">&nbsp;url&nbsp;</a>]";
      else
        links += "&nbsp;[<a href=\"http://" + tags.url + "\" target=\"_blank\" rel=\"nofollow\">&nbsp;url&nbsp;</a>]";
    }
    if (tags.website)
    {
      if (tags.website.substr(0, 4) == "http")
        links += "&nbsp;[<a href=\"" + tags.website + "\" target=\"_blank\" rel=\"nofollow\">&nbsp;website&nbsp;</a>]";
      else
        links += "&nbsp;[<a href=\"http://" + tags.website + "\" target=\"_blank\" rel=\"nofollow\">&nbsp;website&nbsp;</a>]";
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
    
    var details_added = "";
    details_added += linkDetector(element.tags);
    details_added += addressDetector(element.tags);
    
    var lastState = 0;
    
    return {
      'element': element,
      'class_': class_,
      'index': index,
      'name': name,
      'details_added': details_added,
      'sameTags': [],
      'lastState': lastState,
      
      'generateHeadline': function()
      {
        var result = "<em>" + this.class_ + "</em><br/>";
        if (this.element.type == "node" || this.element.type == "way" || this.element.type == "relation")
          result += "<a href=\"http://osm.org/browse/"+ this.element.type + "/" + this.element.id +"\" target=\"_blank\"><strong>" + this.name + "</strong></a>";
        else
          result += "<strong>" + this.name + "</strong>";
        return result;
      },
      
      'showSameTagsElements': function()
      {
        var result = "";
        if (this.sameTags.length > 0)
        {
          result += "<br/><strong>with same tags: ";
          for (var i = 0; i < this.sameTags.length; ++i)
            result += "&nbsp;[<a href=\"http://osm.org/browse/" + this.sameTags[i].type + "/" + this.sameTags[i].id + "\" target=\"_blank\">" + (i+2) + "</a>]";
          result += "</strong>";
        }
        return result;
      },
      
      'headline': function()
      {
        this.lastState = 0;
        var result = this.generateHeadline();
        if (this.details_added == "")
          result += "&nbsp;[&nbsp;details&nbsp;]";
        else
          result += "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
              + ".showDetails()\">&nbsp;details&nbsp;</a>]";
        result += "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
            + ".showTags()\">&nbsp;tags&nbsp;</a>]";        
        result += this.showSameTagsElements();
        return result;
      },
      
      'details': function()
      {
        this.lastState = 1;
        var result = this.generateHeadline()
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showHeadline()\">&nbsp;brief&nbsp;</a>]"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showTags()\">&nbsp;tags&nbsp;</a>]";
        result += this.showSameTagsElements();
        if (this.details_added == "")
          return result + "<br/>no meaningful tags found";
        else
          return result + this.details_added;
      },
      
      'tags': function()
      {
        this.lastState = 2;
        var result = this.generateHeadline()
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showHeadline()\">&nbsp;brief&nbsp;</a>]";
        if (this.details_added == "")
          result += "&nbsp;[&nbsp;details&nbsp;]";
        else
          result += "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
              + ".showDetails()\">&nbsp;details&nbsp;</a>]";
        result += this.showSameTagsElements();
        for (key in element.tags)
          result += "<br/><em>" + key + "</em>: " + element.tags[key];
        return result;
      },
      
      'show': function()
      {
        if (this.lastState == 0)
          return "<p id=\"popupEntry_" + index + "\">" + this.headline() + "</p>";
        else if (this.lastState == 1)
          return "<p id=\"popupEntry_" + index + "\">" + this.details() + "</p>";
        else if (this.lastState == 2)
          return "<p id=\"popupEntry_" + index + "\">" + this.tags() + "</p>";
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
              var exists_already = 0;
              if (response.elements[i].tags)
              {
                var jsonRep = JSON.stringify(response.elements[i].tags);
                for (var j = 0; j < popupEntries.length; ++j)
                {
                  if (JSON.stringify(popupEntries[j].element.tags) == jsonRep)
                  {
                    exists_already = 1;
                    if (response.elements[i].type == "node"
                        || response.elements[i].type == "way"
                        || response.elements[i].type == "relation")
                      popupEntries[j].sameTags.push(response.elements[i]);
                    break;
                  }
                }
                if (!exists_already)
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
            if (popupEntries.length > 0)
              popupLayer.showContentPage(currentPage);
          }
        }
        else
          display = "Sorry - the database did not respond.";
        
        if (queryState < 2 || (queryState == 2 && popupEntries.length > 0))
        {
          document.getElementById("popupContent").innerHTML = display + "<p><em>Searching for more ...</em></p>";
          ++queryState;
          popupLayer.askForPopupContent();
        }
        else
        {
          if (popupEntries.length == 0 && tolerance < 0.5)
          {
            document.getElementById("popupContent").innerHTML = display + "<p><em>Searching for more ...</em></p>";
            tolerance *= 2;
            boundsLayer.setBounds(
                [[Number(global_latlng.lat) - tolerance * latScale,Number(global_latlng.lng) - tolerance],
                 [Number(global_latlng.lat) + tolerance * latScale,Number(global_latlng.lng) + tolerance]]);
            queryState = 0;
            popupLayer.askForPopupContent();
          }
          else if (popupEntries.length == 0)
            document.getElementById("popupContent").innerHTML =
                "Sorry - no extra information available here.";
          else
            document.getElementById("popupContent").innerHTML = display;
        }
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
