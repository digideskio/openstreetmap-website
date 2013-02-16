var popupLayer = function() {

  var popup = L.popup();
  var popupOpen = 0;
  var queryState = 0;
  var recordedClicks = 0;
                
  var global_latlng = {};
  
  var folded_content = new Array();
  var expanded_content = new Array();

  var display = "";
  
  var popupEntries = new Array();

  // obtain an AJAX request object
  var ajaxRequest = getXmlHttpObject();
  if (ajaxRequest == null)
    alert ("This browser does not support HTTP Request");

  function getXmlHttpObject() {
    if (window.XMLHttpRequest) { return new XMLHttpRequest(); }
    if (window.ActiveXObject)  { return new ActiveXObject("Microsoft.XMLHTTP"); }
    return null;
  }
  
  
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
      popup.setLatLng(global_latlng).setContent("Loading data ...").openOn(map);
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
      display = display.substr(0, display.length - 4)
          + " [<a href=\"#\" onclick=\"popupLayer.showContentPage(" + (Math.floor(popupEntries.length/7)) + ")\">&nbsp;" + (Math.floor(popupEntries.length/7) + 1) + "&nbsp;</a>]</p>";
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
    }
    display += "</p>";
//     if (popupOpen == 1)
    {
      popup.setContent(display).openOn(map);
//       popupOpen = 1;
    }
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
  };
  
  
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
  };
  
  
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
    
    return {
      'element': element,
      'index': index,
      'name': name,
      
      'headline': function()
      {
        return "<strong>" + this.name + "</strong>"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showDetails()\">&nbsp;details&nbsp;</a>]"
          + "&nbsp;[<a href=\"#\" onclick=\"popupLayer.popupEntries[" + index + "]"
          + ".showTags()\">&nbsp;tags&nbsp;</a>]";
      },
      
      'details': function()
      {
        var result = "<strong>" + this.name + "</strong>"
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
        var result = "<strong>" + this.name + "</strong>"
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
  };
  
  
  function popupReturned() {

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
        
        /*if (popupOpen == 0)
          ;
        else */if (queryState < 3)
        {
          popup.setLatLng(global_latlng).setContent(display + "<p><em>Searching for more ...</em></p>").openOn(map);
//           popupOpen = 1;
          ++queryState;
          popupLayer.askForPopupContent();
        }
        else
        {
          popup.setLatLng(global_latlng).setContent(display).openOn(map);
//           popupOpen = 1;
        }
      }
    }
  };
  
  
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
