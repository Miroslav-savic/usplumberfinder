const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC","PR","GU","VI","AS","MP",
]);

const NYC_NEIGHBORHOODS = new Set([
  "jamaica","flushing","astoria","ridgewood","bayside","forest hills",
  "jackson heights","corona","elmhurst","woodside","sunnyside","long island city",
  "ozone park","richmond hill","south richmond hill","rosedale","springfield gardens",
  "howard beach","hollis","queens village","cambria heights","laurelton","st. albans",
  "st albans","fresh meadows","briarwood","kew gardens","woodhaven","maspeth",
  "middle village","glendale","rego park","whitestone","college point","little neck",
  "douglaston","glen oaks","floral park","bellerose","rockaway park","far rockaway",
  "belle harbor","arverne","edgemere","neponsit","breezy point",
  // Bronx neighborhoods
  "mott haven","hunts point","melrose","morrisania","highbridge","concourse",
  "university heights","fordham","tremont","belmont","east tremont","west farms",
  "longwood","soundview","castle hill","parkchester","unionport","van nest",
  "morris park","pelham bay","country club","city island","co-op city","baychester",
  "wakefield","williamsbridge","woodlawn","kingsbridge","riverdale","spuyten duyvil",
  "marble hill","norwood","bedford park","allerton","laconia",
  // Brooklyn neighborhoods
  "bushwick","brownsville","east new york","canarsie","flatlands","mill basin",
  "bergen beach","marine park","flatbush","east flatbush","crown heights",
  "prospect heights","park slope","gowanus","red hook","sunset park","bay ridge",
  "dyker heights","bensonhurst","bath beach","borough park","kensington",
  "windsor terrace","ditmas park","midwood","gravesend","sheepshead bay",
  "brighton beach","coney island","sea gate","gerritsen beach","manhattan beach",
  "cobble hill","boerum hill","dumbo","downtown brooklyn","fort greene",
  "clinton hill","bed-stuy","bedford-stuyvesant","williamsburg","greenpoint",
  "cypress hills","highland park","new lots","starrett city",
  // Staten Island neighborhoods
  "tompkinsville","stapleton","clifton","rosebank","port richmond",
  "west brighton","new brighton","snug harbor","graniteville","mariners harbor",
  "port ivory","elm park","westerleigh","castleton corners","new springville",
  "bulls head","heartland village","travis","richmond valley",
  "tottenville","great kills","huguenot","rossville","woodrow","arden heights",
  "annadale","eltingville","bay terrace","dongan hills","midland beach",
  "south beach","arrochar","grasmere","oakwood","new dorp","richmond town",
]);

function normalizeNYC(city) {
  const lc = city.toLowerCase();
  if (NYC_NEIGHBORHOODS.has(lc)) return "New York";
  if (lc === "brooklyn") return "Brooklyn";
  if (lc === "bronx" || lc === "the bronx") return "The Bronx";
  if (lc === "staten island") return "Staten Island";
  if (lc === "queens") return "Queens";
  return city;
}

export function extractCity(address) {
  if (!address) return "";
  const cleaned = address.replace(/,?\s*USA\s*$/, "").trim();
  const parts = cleaned.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1];
  if (/^[A-Z]{2}(\s+\d{5})?$/.test(last) && parts.length >= 2) {
    const stateCode = last.slice(0, 2);
    if (!US_STATES.has(stateCode)) return "";
    return normalizeNYC(parts[parts.length - 2]);
  }
  // No recognizable US state — skip non-US addresses
  return "";
}
