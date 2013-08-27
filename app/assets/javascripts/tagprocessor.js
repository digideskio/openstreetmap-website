
/* TagProcessor: This module collects all functions that make evaluations of objects
 * based purely on their tags.
 * 
 * classifyElement: Takes an OSM element and returns a string that identifies the type of object.
 * 
 * adressDetector: Returns for a set of tags the adress that can be distilled from these tags.
 *     It uses a generic international format, from specific to general, i.e.
 *     housenumber street, postal_code city.
 * 
 * linkDetector: Returns a bunch of HTML that contains formatted links for all tags that can be
 *     interpreted as containing URLs or siginificant parts of URLs.
 * */

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
      address = " " + tags["addr:full"];
    
    if (address == "")
      return "";
    else
      return "<br/><em>address:</em>" + address + "";
  }
  
  
  function i18nDetector(tags)
  {
    var nameXX = "";
    
    for (key in tags)
    {
      if (key.substr(0,5) == "name:")
        nameXX += "<option>" + key.substr(5) + ": " + tags[key] + "</option>";
    }
    
    if (nameXX == "")
      return "";
    else
      return "<br/><select size=\"1\">" + nameXX + "</select>";
  }
  
  
  function classifyElement(element)
  {
    if (!element.tags)
      return "Object without tags";
    tags = element.tags;

    var class_by_tag = [
    {
      "key": "motorroad",
      "values": {
        "yes": "Motorroad"
      }
    },
    {
      "key": "highway",
      "values": {
        "motorway": "Motorway",
        "motorway_link": "Motorway",
        "trunk": "Street",
        "trunk_link": "Street",
        "primary": "Street",
        "primary_link": "Street",
        "secondary": "Street",
        "secondary_link": "Street",
        "tertiary": "Street",
        "tertiary_link": "Street",
        "residential": "Street",
        "service": "Street",
        "living_street": "Street",
        "unclassified": "Street",
        "footway": "Footway",
        "pedestrian": "Footway",
        "path": "Footway",
        "cycleway": "Cycleway",
        "track": "Track",
        "steps": "Steps",
        "construction": "Construction site",
        "bus_stop": "Bus stop"
      }
    },
    {
      "key": "vending",
      "values": {
        "stamps": "Stamp vending machine",
        "cigarettes": "Cigarette vending machine",
        "stamps": "Stamp machine",
        "sweets": "Sweet vending machine"
      }
    },
    {
      "key": "amenity",
      "values": {
        "atm": "ATM",
        "bank": "Bank",
        "cafe": "Café",
        "fast_food": "Fast food restaurant",
        "fire_station": "Fire Station",
        "fuel": "Gas station",
        "grave_yard": "Grave yard",
        "hospital": "Hospital",
        "kindergarten": "Kindergarten",
        "library": "Library",
        "parking": "Parking",
        "place_of_worship": "Place of worship",
        "police": "Police Station",
        "post_box": "Post box",
        "post_office": "Post office",
        "pub": "Pub",
        "restaurant": "Restaurant",
        "school": "School",
        "shelter": "Shelter",
        "university": "University",
        "vending_machine": "Vending Machine"
      }
    },
    {
      "key": "historic",
      "values": {
        "monument": "Monument"
      }
    },
    {
      "key": "natural",
      "values": {
        "water": "Water"
      }
    },
    {
      "key": "tourism",
      "values": {
        "hotel": "Hotel",
        "museum": "Museum",
        "information": "Tourist information",
        "viewpoint": "Viewpoint"
      }
    },
    {
      "key": "leisure",
      "values": {
        "garden": "Leisure park",
        "golf_course": "Golf Course",
        "nature_reserve": "Nature Reserve",
        "park": "Leisure park",
        "pitch": "Sports pitch",
        "playground": "Playground",
        "sports_centre": "Sports centre",
        "swimming_pool": "Swimming pool",
        "track": "Sports track",
        "water_park": "Swimming pool"
      }
    },
    {
      "key": "shop",
      "values": {
        "chemist": "Chemist",
        "bakery": "Bakery",
        "alcohol": "Alcohol",
        "bakery": "Bakery",
        "beauty": "Beauty Parlor",
        "beverages": "Beverages Shop",
        "book": "Book",
        "boutique": "Boutique",
        "butcher": "Butcher",
        "bicycle": "Bicycle",
        "car": "Cars",
        "car_parts": "Car Parts",
        "clothes": "Clothes",
        "computer": "Computer Shop",
        "confectionery": "Confections",
        "convenience": "Convenience store",
        "copyshop": "Copy Shop",
        "curtain": "Curtain Store",
        "deli": "Deli",
        "department_store": "Department Store",
        "doityourself": "DoitYourself Shop",
        "dry_cleaning": "Dry Cleaning",
        "fabric": "Fabric",
        "frame": "Frames",
        "florist": "Florist",
        "funeral_directors": "Funeral Directors",
        "hairdresser": "Hairdresser",
        "hearing_aids": "Hearing aids",
        "kitchen": "Kitchen Store",
        "garden_centre": "Garden Centre",
        "gift": "Gift Shop",
        "greengrocer": "Greengrocer",
        "jewelry": "Jewelry",
        "laundry": "Laundry",
        "mall": "Shopping Mall",
        "mobile_phone": "Mobile Phone Shop",
        "motorcycle": "Motor Cycle",
        "music": "Music",
        "musical_instrument": "Musical Instruments",
        "optician": "Optician",
        "outdoor": "Outdoor Shop",
        "pawnbroker": "Pawnbroker",
        "paint": "Paint Shop",
        "photo": "Photo Shop",
        "tailor": "Tailor",
        "travel_agency": "Travel Agency",
        "seafood": "Seafood",
        "supermarket": "Supermarket",
        "toys": "Toys",
        "trade": "Trade",
        "variety_store": "Variety Store"
      }
    },
    {
      "key": "craft",
      "values": {
        "basket_maker": "Basket Maker",
        "beekeeper": "Bee Keeper",
        "blacksmith": "Blacksmith",
        "bookbinder": "Book Binder",
        "brewery": "Brewery",
        "carpenter": "carpenter",
        "clockmaker": "Clockmaker",
        "distillery": "Distillery",
        "key_cutter": "Key Cutter",
        "photographer": "Photographer",
        "pottery": "Pottery",
        "saddler": "Saddler",
        "shoemaker": "Shoemaker",
        "stonemason": "Stonemason",
        "upholsterer": "Upholsterer"
      }
    },
    {
      "key": "office",
      "values": {
        "accountant": "Accountant",
        "administration": "Administrative Office",
        "architect": "Architect",
        "company": "Private Company",
        "employment_agency": "Employment Agency",
        "estate_agent": "Estate Agent",
        "foundation": "Foundation Office",
        "government": "Government Office",
        "insurance": "Insurance",
        "it": "IT Specialist",
        "lawyer": "Lawyer",
        "newspaper": "Newspaper",
        "ngo": "NGO",
        "research": "Research Lab",
        "telecommunication": "Telecommunication",
        "travel_agent": "Travel Agent"
      }
    },
    {
      "key": "waterway",
      "values": {
        "dam": "Dam",
        "river": "River",
        "stream": "Stream"
      }
    },
    {
      "key": "railway",
      "values": {
        "station": "Railway station",
        "tram_stop": "Tram stop"
      }
    },
    {
      "key": "public_transport",
      "values": {
        "stop_position": "Public transport stop",
        "platform": "Public transport stop",
        "stop_area": "Public transport stop",
        "stop_area_group": "Public transport stop"
      }
    },
    {
      "key": "building",
      "values": {
        "apartments": "Apartment Building",
        "university": "University Building"
      }
    },
    {
      "key": "landuse",
      "values": {
        "cemetery": "Grave yard",
        "commercial": "Commercial area",
        "forest": "Forest",
        "farm": "Farm",
        "industrial": "Industrial park",
        "meadow": "Meadow",
        "military": "Military area",
        "orchard": "Orchard",
        "quarry": "Quarry",
        "residential": "Residential area",
        "retail": "Shopping center"
      }
    },
    {
      "key": "route",
      "values": {
        "bicycle": "Cycling route",
        "bus": "Bus route",
        "detour": "Detour",
        "ferry": "Ferry route",
        "foot": "Walking route",
        "hiking": "Walking route",
        "light_rail": "Light rail",
        "power": "Power line",
        "road": "Road number",
        "subway": "Metro route",
        "train": "Train route",
        "tram": "Light rail"
      }
    },
    {
      "key": "type",
      "values": {
        "associatedStreet": "Associated street",
        "multipolygon": "Area of unknown type",
        "relatedBuilding": "Area of unknown type",
        "site": "Area of unknown type"
      }
    },
    {
      "key": "admin_level",
      "values": {
        "2": "Country boundary",
        "3": "State boundary",
        "4": "State boundary",
        "5": "City boundary",
        "6": "City boundary",
        "7": "City boundary",
        "8": "Suburb boundary",
        "9": "Suburb boundary",
        "10": "Suburb boundary",
        "11": "Suburb boundary"
      }
    },
    {
      "key": "boundary",
      "values": {
        "administrative": "Administrative boundary"
      }
    } ];
    
    for (var i = 0; i < class_by_tag.length; ++i)
    {
      if (tags[class_by_tag[i].key])
      {      
        if (class_by_tag[i].values[tags[class_by_tag[i].key]])
          return class_by_tag[i].values[tags[class_by_tag[i].key]];
      }
    }

    return "Other object";
  }
  
  
  return {
    'linkDetector': linkDetector,
    'addressDetector': addressDetector,
    'i18nDetector': i18nDetector,
    'classifyElement': classifyElement
  }
}();
