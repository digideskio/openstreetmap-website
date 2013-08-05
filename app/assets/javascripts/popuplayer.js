//= require tagprocessor

/* PopupLayer: Provides at every place of the map information about all named elements at thihs place.
 * 
 * popupLayer: manages the popups.
 * createPopupEntry: the factory for the viewers for a single OSM element.
 * */  
  
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
  var popupEntryDictionary = {};

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

  var basemap = {};
  
  function onMapClick(e)
  {
    if (popupOpen == 0)
    {
      global_latlng = e.latlng;
      recordedClicks = 1;
      setTimeout(openPopup, 300);
    }
    else if (popupOpen == 3)
      basemap.popupClose();
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
    if (basemap.hasLayer(boundsLayer))
      basemap.removeLayer(boundsLayer);
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
      popup.setLatLng(global_latlng).setContent("<div id=\"popupContent\" style=\"width: 320px\">Loading data ...</div>").openOn(basemap);
      
      latlng = global_latlng;
      tolerance = calculateCoordTolerance(basemap.getZoom());
      latScale = Math.cos(latlng.lat / 180.0 * Math.PI);
      
      boundsLayer.setBounds(
          [[Number(latlng.lat) - tolerance * latScale,Number(latlng.lng) - tolerance],
           [Number(latlng.lat) + tolerance * latScale,Number(latlng.lng) + tolerance]]);
      boundsLayer.addTo(basemap);
      
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
          + ");out;";
          
    } else if (queryState == 1) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter?data="
          + "[timeout:5][out:json];way("
          + (Number(latlng.lat) - tolerance * latScale) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance * latScale) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;";
          
    } else if (queryState == 2) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter?data="
          + "[timeout:5][out:json];rel("
          + (Number(latlng.lat) - tolerance * latScale) + ","
          + (Number(latlng.lng) - tolerance) + ","
          + (Number(latlng.lat) + tolerance * latScale) + ","
          + (Number(latlng.lng) + tolerance)
          + ");out;";
          
    } else if (queryState == 3) {
      
      // request the marker info with AJAX for the current bounds
      var msg = "http://overpass-api.de/api/interpreter?data="
          + "[timeout:5][out:json];is_in("
          + latlng.lat + "," + latlng.lng
          + ");out;";
          
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
    
  
  function popupReturned()
  {
    // if AJAX returned a list of objects, add them to the popup
    if (ajaxRequest.readyState == 4 && ajaxRequest.status == 200)
    {
      // Extract all OSM objects from the response and make a popupEntry for each unique
      var response = jQuery.parseJSON(ajaxRequest.responseText);
      if (response.elements && ajaxRequest.responseText.search("timestamp_osm_base") != -1)
      {
        var popupEntries = popupLayer.popupEntries;
        for (var i = 0; i < response.elements.length; ++i)
        {
          var element = response.elements[i];
          if (element.tags)
          {
            // Check whether an element with the same tags exists already.
            var jsonRep = JSON.stringify(element.tags);
            if (popupEntryDictionary[jsonRep])
            {
              // If the new element is a proper OSM element then add this to the existing element
              // as a same tags entry. We don't add derived elements because they most likely appear
              // together with the element they have been derived from.
              if (element.type == "node" || element.type == "way" || element.type == "relation")
                popupEntryDictionary[jsonRep].sameTags.push(element);
            }
            else
            {
              // Make a new entry for the element
              var entry = createPopupEntry(element, popupEntries.length);
              if (entry.show)
              {
                popupEntries.push(entry);
                popupEntryDictionary[jsonRep] = entry;
              }
            }
          }
        }
        
        // If we have found anything then update the variable display and show the new information.
        if (popupEntries.length > 0)
          popupLayer.showContentPage(currentPage);
      }
      else
        display += "<em>Sorry - the database server did not respond.</em>";
      
      // Manage the overall behaviour of the popup:
      // If we haven't all data yet, trigger the next query to complete the results

      // In particular: If we have still nodes, ways or relations to find then query for them.
      // If we only have areas the query left then query for them only if we have already found objects.
      // This allows to otherwise extend the search radius. It makes sense because areas exist virtually
      // everywhere on the planet, even in significant parts of the oceans, while no real objects
      // are a quite good indicator that the user meant a larger search radius.
      if (queryState < 2 || (queryState == 2 && popupEntries.length > 0))
      {
        document.getElementById("popupContent").innerHTML = display + "<p><em>Searching for more ...</em></p>";
        ++queryState;
        popupLayer.askForPopupContent();
      }
      else
      {
        // We haven't found objects yet. Thus we try a larger search radius
        // if this larger search radius is still sane.
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
  
  
  return {
    'onMapClick': onMapClick,
    'onDoubleClick': onDoubleClick,
    'onPopupClose': onPopupClose,
    'onPopupOpen': onPopupOpen,
    'showContentPage': showContentPage,
    'askForPopupContent': askForPopupContent,
    'collapse': function(i) {
      document.getElementById("popup_" + i).innerHTML = folded_content[i];
    },
    'expand': function(i) {
      document.getElementById("popup_" + i).innerHTML = expanded_content[i];
    },
    'setBasemap': function(map) {
      basemap = map;
    },
    'popupEntries': popupEntries
  }
  
}();


var createPopupEntry = function(element, index)
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
  
  var class_ = TagProcessor.classifyElement(element);
  
  var details_added = "";
  details_added += TagProcessor.linkDetector(element.tags);
  details_added += TagProcessor.addressDetector(element.tags);
  
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
};
