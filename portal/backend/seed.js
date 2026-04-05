require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/postModel");

const posts = [
  {
    title: "Bosanski izvoznici oborili rekord u 2025. godini",
    companyName: "Izvoz BiH d.o.o.",
    content: "<p>Bosanskohercegovački izvoznici zabilježili su rekordne rezultate u prvoj polovini 2025. godine. Ukupna vrijednost izvoza dostigla je 8,2 milijarde KM, što predstavlja rast od 14% u odnosu na isti period prošle godine. Posebno se ističu sektori prerađivačke industrije i drvne industrije.</p><p>Analitičari navode da je ovaj rast rezultat povećane tražnje na tržištima EU, ali i diversifikacije izvoznih destinacija prema tržištima Bliskog istoka i Azije.</p>",
    status: "active",
    viewCount: 342,
  },
  {
    title: "Tehnološki park Sarajevo prima prijave za novu kohortu startupa",
    companyName: "TechPark Sarajevo",
    content: "<p>Tehnološki park Sarajevo objavio je otvaranje prijava za petu kohortu svog akceleratorskog programa. Program je namijenjen ranim startupima iz oblasti informacijskih tehnologija, fintech-a i green-tech sektora.</p><p>Odabrani startupovi dobit će finansijsku podršku od 25.000 EUR, mentorstvo vodećih stručnjaka iz industrije, te pristup uredskim prostorima u trajanju od 12 mjeseci. Rok za prijave je 15. april 2025.</p>",
    status: "active",
    viewCount: 218,
  },
  {
    title: "Mostar Aluminij potpisao ugovor vrijedan 120 miliona EUR",
    companyName: "Aluminij Mostar d.d.",
    content: "<p>Kompanija Aluminij iz Mostara potpisala je višegodišnji ugovor o isporuci aluminijskih poluproizvoda sa evropskim partnerom, u ukupnoj vrijednosti od 120 miliona EUR. Ugovor je potpisan na sajmu metala u Düsseldorfu.</p><p>Generalni direktor kompanije izjavio je da ovaj ugovor osigurava stabilnost poslovanja za narednih pet godina i otvara vrata za daljnje proširenje kapaciteta postrojenja u Mostaru.</p>",
    status: "active",
    viewCount: 489,
  },
  {
    title: "Nova investicija u obnovljive izvore energije u Federaciji BiH",
    companyName: "GreenEnergy Solutions",
    content: "<p>Kompanija GreenEnergy Solutions najavila je izgradnju solarnog parka snage 50 MW u Neretvanskoj dolini. Ukupna vrijednost investicije iznosi 45 miliona EUR, a projekt će biti realizovan u partnerstvu sa lokalnim vlastima.</p><p>Planirani kapacitet parka omogućit će napajanje više od 30.000 domaćinstava čistom energijom, čime BiH radi konkretne korake prema ispunjenju klimatskih ciljeva.</p>",
    status: "active",
    viewCount: 175,
  },
  {
    title: "BH Telecom proširuje 5G mrežu na nova područja",
    companyName: "BH Telecom d.d.",
    content: "<p>BH Telecom je najavio proširenje 5G mreže na dodatnih 12 gradova u Federaciji BiH do kraja 2025. godine. Investicija u infrastrukturu iznosi 38 miliona KM i obuhvatat će instalaciju više od 200 novih baznih stanica.</p><p>Uz proširenje pokrivenosti, kompanija uvodi i nove pakete za poslovne korisnike koji uključuju napredna IoT rješenja i cloud usluge prilagođene malim i srednjim preduzećima.</p>",
    status: "active",
    viewCount: 267,
  },
  {
    title: "Pivara Sarajevo osvaja nagradu za najbolji craft pivo u regiji",
    companyName: "Pivara Sarajevo d.o.o.",
    content: "<p>Na regionalnom takmičenju craft pivara održanom u Zagrebu, Pivara Sarajevo je odnijela dvije zlatne medalje — za lager i tamno pivo limitirane edicije. Žiri je posebno pohvalio kvalitet sirovina i inovativnost u procesu fermentacije.</p><p>Kompanija planira otvaranje novog taproom prostora u centru Sarajeva, koji će ujedno služiti i kao centar za edukaciju o kulturi piva na prostoru Balkana.</p>",
    status: "active",
    viewCount: 134,
  },
  {
    title: "Agrokomerc lansira novu liniju organskih proizvoda",
    companyName: "Agrokomerc d.d.",
    content: "<p>Kompanija Agrokomerc iz Velike Kladuše lansirala je novu liniju certificiranih organskih prehrambenih proizvoda pod brendom 'Zelena dolina'. Linija obuhvata više od 40 artikala, od mesnih prerađevina do mliječnih proizvoda.</p><p>Proizvodi su već dostupni u maloprodajnoj mreži širom BiH, a u narednom kvartalu planira se plasman na tržišta Austrije i Njemačke gdje postoji velika bosanskohercegovačka dijaspora.</p>",
    status: "active",
    viewCount: 198,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/portal");
  console.log("Connected to MongoDB");

  const existing = await Post.countDocuments();
  if (existing > 0) {
    console.log(`Već postoji ${existing} postova — seed preskočen.`);
    process.exit(0);
  }

  await Post.insertMany(posts);
  console.log(`Ubačeno ${posts.length} postova.`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
