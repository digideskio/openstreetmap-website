var TagProcessor = function()
{
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
  
  
  return {
    'linkDetector': linkDetector,
    'addressDetector': addressDetector,
    'classifyElement': classifyElement
  }
}();
