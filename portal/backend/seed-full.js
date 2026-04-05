/**
 * seed-full.js
 * Briše sve postojeće postove, skida slike s interneta i kreira 20 postova
 * za najveće kompanije u BiH.
 *
 * Pokretanje:
 *   node seed-full.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const Post = require("./src/models/postModel");

const UPLOADS_DIR = path.join(__dirname, "uploads");

// ---------------------------------------------------------------------------
// Podaci o postovima + URL slike za svaku kompaniju
// ---------------------------------------------------------------------------
const POSTS = [
  {
    title: "BH Telecom širi 5G mrežu na 15 novih gradova u BiH",
    companyName: "BH Telecom d.d. Sarajevo",
    content: "<p>BH Telecom, vodeći telekomunikacijski operator u Federaciji BiH, najavio je najveću infrastrukturnu investiciju u historiji kompanije. U narednih 18 mjeseci planira se instalacija više od 300 novih 5G baznih stanica u 15 gradova, uz ukupnu vrijednost investicije od 85 miliona KM.</p><p>Uz proširenje mreže, kompanija uvodi napredne IoT pakete za poslovne korisnike, cloud platformu za SME sektor, te usluge pametnih gradova u saradnji s lokalnim upravama. BH Telecom trenutno zapošljava više od 3.500 radnika i jedan je od najvećih poreznih obveznika u FBiH.</p>",
    address: "Franca Lehara 7, Sarajevo", lat: 43.8476, lng: 18.3564,
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  },
  {
    title: "Elektroprivreda BiH postigla rekordnu proizvodnju električne energije",
    companyName: "JP Elektroprivreda BiH d.d.",
    content: "<p>Javno preduzeće Elektroprivreda BiH zabilježilo je rekordnu godišnju proizvodnju električne energije — 8,4 TWh, što je povećanje od 11% u odnosu na prethodnu godinu. Ovaj rezultat ostvaren je zahvaljujući modernizaciji termoelektrana i povoljnim hidrološkim uslovima.</p><p>EP BiH najavljuje investiciju od 400 miliona KM u modernizaciju distributivne mreže i izgradnju novih obnovljivih izvora energije do 2030. godine. Kompanija zapošljava oko 7.800 radnika i ključni je energetski stub Federacije BiH.</p>",
    address: "Vilsonovo šetalište 15, Sarajevo", lat: 43.8519, lng: 18.3874,
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
  },
  {
    title: "ArcelorMittal Zenica ulaže 200 miliona EUR u modernizaciju čeličane",
    companyName: "ArcelorMittal Zenica d.o.o.",
    content: "<p>ArcelorMittal Zenica, najveći proizvođač čelika u BiH i regiji, pokrenuo je ambiciozan program modernizacije postrojenja vrijedan 200 miliona EUR. Investicija obuhvata ugradnju nove visokopeći, modernizaciju valjaonice i implementaciju sistema za smanjenje emisija CO2.</p><p>Programom modernizacije planira se povećanje godišnje kapaciteta proizvodnje čelika s 1,5 na 2,1 milion tona, uz istovremeno smanjenje ugljeničnog otiska za 30%. Kompanija zapošljava više od 3.200 radnika u Zenici, a neizravno podupire još 12.000 radnih mjesta u dobavnom lancu.</p>",
    address: "Željezara bb, Zenica", lat: 44.2019, lng: 17.9078,
    imageUrl: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80",
  },
  {
    title: "Bosnalijek proširuje izvoz lijekova na 35 tržišta Evropske unije",
    companyName: "Bosnalijek d.d. Sarajevo",
    content: "<p>Bosnalijek, vodeća farmaceutska kompanija u BiH, dobio je odobrenja Evropske agencije za lijekove za plasman 18 novih generičkih preparata na tržišta EU. Kompanija planira povećati izvoz za 40% u naredne dvije godine, s ciljem dosezanja prihoda od 180 miliona EUR.</p><p>U sklopu strategije rasta, Bosnalijek gradi novu modernu fabriku u Industrijskoj zoni Vogošća vrijednu 60 miliona EUR. Nova postrojenja zadovoljit će najstrože GMP standarde i otvoriti 500 novih radnih mjesta visoke stručnosti.</p>",
    address: "Jukićeva 53, Sarajevo", lat: 43.8607, lng: 18.3878,
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80",
  },
  {
    title: "Prevent Group otvara novi pogon i zapošljava 800 radnika u Visokom",
    companyName: "Prevent Group d.o.o.",
    content: "<p>Prevent Group, jedan od najvećih privatnih poslodavaca u BiH s više od 10.000 zaposlenika, otvara novi proizvodni pogon za automobilske komponente u Visokom. Investicija iznosi 45 miliona EUR, a planira se zapošljavanje 800 novih radnika do kraja godine.</p><p>Nova fabrika će proizvoditi sjedišta i unutrašnje obloge za prestižne europske automobilske brendove Volkswagen, BMW i Daimler. Prevent Group posluje u 14 zemalja i ostvaruje godišnji prihod od više od 700 miliona EUR.</p>",
    address: "Aleja Konzula 12, Visoko", lat: 44.0004, lng: 18.1777,
    imageUrl: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80",
  },
  {
    title: "Bingo otvara 15 novih prodajnih centara i širi se u Srbiju",
    companyName: "Bingo d.o.o. Tuzla",
    content: "<p>Maloprodajni gigant Bingo najavio je otvaranje 15 novih prodajnih centara u BiH i prvog objekta u Srbiji do kraja poslovne godine. Kompanija sa sjedištem u Tuzli planira investirati 120 miliona KM u novu infrastrukturu, logistiku i modernizaciju postojeće mreže od 130 prodajnih mjesta.</p><p>Bingo zapošljava više od 6.500 radnika i lider je na tržištu maloprodaje u BiH s godišnjim prometom koji premašuje 1,5 milijardu KM. U sklopu ekspanzije uvodi i digitalni loyalty program s više od 400.000 aktivnih korisnika.</p>",
    address: "Rudarska 57, Tuzla", lat: 44.5386, lng: 18.6746,
    imageUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80",
  },
  {
    title: "Sarajevo Osiguranje lansira potpuno digitalnu platformu za osiguranje",
    companyName: "Sarajevo Osiguranje d.d.",
    content: "<p>Sarajevo Osiguranje, jedno od najstarijih i najvećih osiguravajućih društava u BiH, lansiralo je revolucionarnu digitalnu platformu koja omogućuje sklapanje svih vrsta polica osiguranja putem mobitela u manje od 5 minuta.</p><p>Platforma, razvijena u saradnji s europskim fintech partnerima, nudi kasko, putno, životno i zdravstveno osiguranje s instant isplatom šteta do 2.000 KM bez papirne dokumentacije. Kompanija planira kroz digitalnu transformaciju povećati bazu klijenata za 35% u naredne tri godine.</p>",
    address: "Zmaja od Bosne 47, Sarajevo", lat: 43.8553, lng: 18.3994,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    title: "Natron-Hayat investira 120 miliona EUR u novu papirnu industriju",
    companyName: "Natron-Hayat d.o.o. Maglaj",
    content: "<p>Natron-Hayat, vodeći proizvođač kraftliner papira u jugoistočnoj Evropi, najavio je stratešku investiciju od 120 miliona EUR u izgradnju nove papirne mašine kapaciteta 350.000 tona godišnje. Ova investicija čini Natron-Hayat jednim od najvećih pojedinačnih investitora u prerađivačku industriju BiH u posljednjih 20 godina.</p><p>Kompanija iz Maglaja izvozi 95% svoje produkcije u 27 zemalja, a godišnji prihod premašuje 350 miliona EUR. Novom investicijom planira se otvaranje dodatnih 400 radnih mjesta i povećanje kapaciteta za 60%.</p>",
    address: "Industrijska zona bb, Maglaj", lat: 44.5525, lng: 18.0936,
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  },
  {
    title: "Violeta uvodi ekološku liniju proizvoda i osvaja EU certifikate",
    companyName: "Violeta d.o.o. Grude",
    content: "<p>Violeta, jedan od vodećih proizvođača higijenskih papirnih proizvoda na Balkanu, lansirala je potpuno novu ekološku liniju 'Zelena Violeta' koja je izrađena od 100% recikliranog papira i pakirana u biorazgradive materijale. Linija je dobila EU Ecolabel certifikat i već je dostupna u 18 europskih zemalja.</p><p>Kompanija iz Gruda investirala je 30 miliona EUR u modernizaciju proizvodnih procesa i prelazak na obnovljive izvore energije. Violeta zapošljava 1.200 radnika i izvozi u više od 40 zemalja, s godišnjim prihodom od 220 miliona EUR.</p>",
    address: "Industrijska zona Grude bb", lat: 43.4044, lng: 17.6847,
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
  },
  {
    title: "ASA Group širi bankarske i automobilske operacije u jugoistočnoj Evropi",
    companyName: "ASA Group d.d. Sarajevo",
    content: "<p>ASA Group, jedan od najdiversificiranijih poslovnih konglomerata u BiH, najavio je stratešku ekspanziju bankarskih operacija u Albaniju i Sjevernu Makedoniju, te otvaranje 12 novih automobilskih showrooma u regiji. Ukupna vrijednost investicijskog plana iznosi 85 miliona EUR za period 2025–2027.</p><p>Konglomerat koji obuhvata ASA Banku, ASA Auto, ASA BH Faktoring i niz drugih kompanija, zapošljava više od 4.000 radnika i ostvaruje konsolidovani godišnji prihod od 1,2 milijarde KM.</p>",
    address: "Džemala Bijedića 185, Sarajevo", lat: 43.8214, lng: 18.3601,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    title: "Elektroprivreda HZHB gradi 8 mini hidroelektrana na rijeci Neretvi",
    companyName: "JP Elektroprivreda HZ HB d.d.",
    content: "<p>JP Elektroprivreda HZ HB najavljuje izgradnju 8 mini hidroelektrana na pritokama rijeke Neretve, s ukupnom instaliranom snagom od 42 MW. Projekt vrijedan 95 miliona KM financirat će se kombinacijom vlastitih sredstava i EU fondova za zelenu energiju.</p><p>Izgradnjom novih kapaciteta, EPHZHB povećava udio obnovljive energije u svom portfoliju na 65% i otvara 320 novih radnih mjesta u Hercegovini. Kompanija sa sjedištem u Mostaru zapošljava oko 2.500 radnika.</p>",
    address: "Mile Budaka 106a, Mostar", lat: 43.3438, lng: 17.8082,
    imageUrl: "https://images.unsplash.com/photo-1548613053-22087dd8edb8?w=800&q=80",
  },
  {
    title: "Unis Group potpisao NATO ugovor za isporuku vojnih vozila vrijedan 80 miliona EUR",
    companyName: "Unis Group d.o.o. Sarajevo",
    content: "<p>Unis Group, vodeća odbrambena i industrijska kompanija u BiH, potpisao je strateški ugovor s NATO agencijom za nabavku i logistiku za isporuku 450 oklopnih transportnih vozila u naredne četiri godine. Ugovor vrijedan 80 miliona EUR najveći je izvozni ugovor u historiji bosansko-hercegovačke odbrambene industrije.</p><p>Unis Group zapošljava više od 2.800 inženjera i tehničara u fabrikama u Sarajevu, Vogošći i Travniku. Kompanija razvija i novu generaciju dronova za potrebe NATO saveznika.</p>",
    address: "Džemala Bijedića 2, Sarajevo", lat: 43.8198, lng: 18.3714,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
  {
    title: "Kakanj Cement postiže rekordni izvoz cementa u 2025. godini",
    companyName: "Kakanj Cement d.d.",
    content: "<p>Kakanj Cement, jedan od najvećih proizvođača cementa na zapadnom Balkanu s godišnjim kapacitetom od 1,3 miliona tona, ostvario je rekordni izvoz od 780.000 tona cementa u prvoj polovini 2025. Prihodi od izvoza premašili su 95 miliona EUR, što je povećanje od 18% u odnosu na isti period prošle godine.</p><p>Kompanija investira 25 miliona EUR u modernizaciju peći radi smanjenja emisije CO2 za 25% do 2027. godine. Kakanj Cement zapošljava 850 radnika i ključan je ekonomski stub lokalne zajednice.</p>",
    address: "Kakanj bb, Kakanj", lat: 44.1275, lng: 18.1162,
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  },
  {
    title: "BH Gas pokreće projekat gasifikacije 40 novih opština u BiH",
    companyName: "BH Gas d.o.o. Sarajevo",
    content: "<p>BH Gas, operator transportnog sistema prirodnog gasa u Federaciji BiH, pokrenuo je ambiciozan projekt gasifikacije koji obuhvata 40 do sada negasificiranih opština. Vrijednost projekta iznosi 180 miliona KM, a financira se iz kombinacije domaćih izvora i međunarodnih kredita EIB banke.</p><p>Projekat će u narednih pet godina osigurati pristup prirodnom gasu za više od 200.000 domaćinstava i 5.000 poslovnih subjekata. BH Gas transportira godišnje oko 2,5 milijardi kubnih metara gasa i zapošljava 450 visokokvalificiranih radnika.</p>",
    address: "Hamdije Ćemerlića 2, Sarajevo", lat: 43.8579, lng: 18.4127,
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
  },
  {
    title: "Bemaks gradi novi poslovni kompleks u Banja Luci vrijedan 60 miliona EUR",
    companyName: "Bemaks d.o.o. Banja Luka",
    content: "<p>Bemaks, vodeći građevinski i nekretninski konglomerat u Republici Srpskoj, najavio je izgradnju modernoga mješovitog poslovnog kompleksa 'Bemaks Tower' u centru Banja Luke. Projekt obuhvata 35.000 m² poslovnog prostora, 8.000 m² maloprodaje i 15 katova luksuznih stambenih apartmana.</p><p>Kompanija, koja je do sada izgradila više od 200 stambenih i poslovnih objekata u RS i FBiH, investira 60 miliona EUR u ovaj flagship projekat. Bemaks zapošljava direktno 1.200 radnika.</p>",
    address: "Kralja Petra I Karađorđevića 97, Banja Luka", lat: 44.7722, lng: 17.1910,
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  },
  {
    title: "Energopetrol modernizira 80 benzinskih stanica i uvodi EV punjače",
    companyName: "Energopetrol d.d. Sarajevo",
    content: "<p>Energopetrol, operater najveće maloprodajne mreže naftnih derivata u BiH s 80 benzinskih stanica, pokrenuo je sveobuhvatan program modernizacije vrijedan 35 miliona KM. Program uključuje rekonstrukciju svih stanica po novim standardima, uvođenje automatiziranih praonica i instalaciju 160 punjača za električna vozila.</p><p>Kompanija uvodi i mobilnu aplikaciju za plaćanje, loyalty program i monitoring potrošnje goriva za flote vozila. Energopetrol planira do 2027. svim lokacijama osigurati solarnu energiju.</p>",
    address: "Skenderija 3, Sarajevo", lat: 43.8509, lng: 18.4167,
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
  },
  {
    title: "Nutricija Stark povećava izvoz čokolade i slatkiša u 50 zemalja",
    companyName: "Nutricija Stark d.o.o. Sarajevo",
    content: "<p>Nutricija Stark, producentska kuća legendarnih bosanskih brendova Stark čokolade, Cipiripi i Eurokrem, najavljuje povećanje izvoznih kapaciteta za 45% ulaganjem od 28 miliona EUR u modernizaciju pogona u Sarajevu. Kompanija već izvozi u 50 zemalja i planira ulazak na tržišta Kanade i Australije.</p><p>Stark čokolada, prisutna na tržištu više od 70 godina, doživljava renesansu zahvaljujući nostalgi-marketingu i novim premium linijama. Kompanija zapošljava 850 radnika.</p>",
    address: "Hamdije Kapidžića 41, Sarajevo", lat: 43.8390, lng: 18.3723,
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80",
  },
  {
    title: "Farmland gradi novu modernu mljekaru kapaciteta 500.000 litara dnevno",
    companyName: "Farmland d.o.o. Livno",
    content: "<p>Farmland, vodeći mljekarski kombinat u BiH, gradi najmoderniji mljekarski pogon u jugoistočnoj Evropi pored Livna. Nova fabrika, vrijedna 55 miliona EUR, imat će kapacitet prerade 500.000 litara mlijeka dnevno i koristit će isključivo obnovljive izvore energije.</p><p>Livanjski sir, koji nosi oznaku geografskog porijekla, godišnje se proizvede 450 tona od čega se 60% izvozi u Europu i SAD. Kompanija surađuje s više od 1.200 kooperanata — farmera s područja Livanjskog polja.</p>",
    address: "Gabela bb, Livno", lat: 43.8256, lng: 17.0079,
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80",
  },
  {
    title: "Telekom Srpske gradi optičku mrežu i spaja 200.000 domaćinstava",
    companyName: "m:tel / Telekom Srpske a.d.",
    content: "<p>Telekom Srpske, vodeći telekomunikacijski operator u Republici Srpskoj i vlasnik brenda m:tel, investira 130 miliona KM u izgradnju optičke FTTH mreže koja će do 2026. pokriti 200.000 domaćinstava i svih 64 opštine u RS. Projekat će donijeti gigabitni internet u svako domaćinstvo, uključujući i ruralna područja.</p><p>Kompanija sa sjedištem u Banja Luci zapošljava više od 2.800 radnika i pruža usluge s bazom od 1,1 miliona korisnika.</p>",
    address: "Kralja Petra I Karađorđevića 93, Banja Luka", lat: 44.7731, lng: 17.1891,
    imageUrl: "https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=800&q=80",
  },
  {
    title: "m:tel i Telekom Srpske lansiraju IoT platformu za pametne gradove u BiH",
    companyName: "m:tel d.o.o. Banja Luka",
    content: "<p>m:tel, u saradnji s matičnom kompanijom Telekom Srpske i partnerima iz Njemačke i Japana, lansirao je sveobuhvatnu IoT platformu za pametne gradove 'SmartCity BiH'. Platforma je već implementirana u Banja Luci i Prijedoru, a do kraja 2025. planira se proširenje na 10 gradova u cijeloj BiH.</p><p>Sistem obuhvata pametno upravljanje prometom, automatski monitoring kvaliteta zraka i vode, pametnu javnu rasvjetu te digitalne servise za građane. Investicija od 22 miliona EUR pozicionira BiH kao regionalnog lidera u digitalnoj transformaciji javnih usluga.</p>",
    address: "Vase Pelagića 6, Banja Luka", lat: 44.7693, lng: 17.1964,
    imageUrl: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&q=80",
  },
];

// ---------------------------------------------------------------------------
// Helper: skida fajl s URL-a (prati redirecte)
// ---------------------------------------------------------------------------
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);

    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(destPath); } catch (_) {}
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destPath); } catch (_) {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      try { fs.unlinkSync(destPath); } catch (_) {}
      reject(err);
    });
  });
}

// ---------------------------------------------------------------------------
// Glavni tok
// ---------------------------------------------------------------------------
async function run() {
  // Osiguraj da uploads direktorij postoji
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log("Kreiran uploads/ direktorij.");
  }

  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/portal");
  console.log("Konekcija na MongoDB uspješna.\n");

  // Brisanje svih postojećih postova
  const { deletedCount } = await Post.deleteMany({});
  console.log(`Obrisano ${deletedCount} postojećih postova.\n`);

  // Kreiranje postova jedan po jedan (download slike → insert)
  let uspješno = 0;
  for (let i = 0; i < POSTS.length; i++) {
    const data = { ...POSTS[i] };
    const imageUrlRemote = data.imageUrl;
    delete data.imageUrl; // ne šaljemo remote URL u model, nego lokalni path

    process.stdout.write(`[${i + 1}/${POSTS.length}] ${data.companyName} — skidanje slike... `);

    const filename = `seed-${Date.now()}-${i}.jpg`;
    const destPath = path.join(UPLOADS_DIR, filename);

    try {
      await downloadFile(imageUrlRemote, destPath);
      data.imageUrl = `/uploads/${filename}`;
      process.stdout.write("OK — ");
    } catch (err) {
      data.imageUrl = "";
      process.stdout.write(`slika nije preuzeta (${err.message}) — `);
    }

    try {
      await Post.create({ ...data, status: "active" });
      console.log("post kreiran.");
      uspješno++;
    } catch (err) {
      console.log(`greška pri kreiranju posta: ${err.message}`);
    }

    // Mali delay da ne preopteretimo Unsplash
    await new Promise((r) => setTimeout(r, 350));
  }

  console.log(`\nGotovo! Kreirano ${uspješno}/${POSTS.length} postova.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatalna greška:", err);
  process.exit(1);
});
