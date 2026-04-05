require("dotenv").config();
const mongoose = require("mongoose");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const Post = require("./src/models/postModel");

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// 50 privatnih medicinskih klinika i ordinacija u BiH
const klinike = [
  // ─── BANJA LUKA (1–20) ───────────────────────────────────────────────────
  {
    title: "Prima MEDICA – privatna poliklinika Banja Luka",
    companyName: "ZU Privatna klinika Prima MEDICA",
    content: "<p>Prima MEDICA je jedna od najvećih privatnih zdravstvenih ustanova u Banja Luci s više od 25 specijalističkih ambulanti i 30+ doktora specijalista. Klinika nudi kompletnu dijagnostiku, laboratorijske analize i specijalističke preglede iz više od 200 medicinskih oblasti.</p><p>Dostupne specijalnosti: interna medicina, kardiologija, gastroenterologija, ginekologija, pedijatrija, ortopedija, neurologija, psihijatrija, hematologija, infektologija, fizikalna medicina, vaskularna hirurgija, plastična hirurgija i mnoge druge. Radno vrijeme: pon–pet 08–20h, sub 08–14h.</p>",
    address: "Duška Koščice 33, 78000 Banja Luka",
    lat: 44.7758, lng: 17.1943,
    phone: "+387 51 265 000", email: "kontakt@primamedicabl.com",
    status: "active", viewCount: 2140,
    _img: "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?w=800",
  },
  {
    title: "MR Klinika – privatna poliklinika i klinički centar Banja Luka",
    companyName: "MR Klinika d.o.o. Banja Luka",
    content: "<p>MR Klinika je savremena privatna poliklinika i klinički centar u Banja Luci koji nudi ljekarsku skrb i dijagnostiku u više od 30 grana medicine. Centar raspolaže najmodernijom medicinskom opremom i timom iskusnih specijalista.</p><p>Specijalnosti uključuju: neurologiju, gastroenterologiju, vaskularnu hirurgiju, ortopediju, ginekologiju, logopediju i mnoge druge. Zakazivanje termina putem telefona ili online formulara.</p>",
    address: "Vase Pelagića 19A, 78000 Banja Luka",
    lat: 44.7693, lng: 17.1964,
    phone: "+387 66 061 000", email: "info@mrklinika.ba",
    status: "active", viewCount: 1870,
    _img: "https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?w=800",
  },
  {
    title: "Specijalna bolnica Be Well – 14 centara zdravlja, Banja Luka",
    companyName: "ZU Specijalna bolnica Be Well Banja Luka",
    content: "<p>Specijalna bolnica Be Well u Banja Luci nudi specijalističku dijagnostiku, minimalno invazivne procedure i bolnički smještaj. Sa 14 centara zdravlja, timom od 70+ domaćih i regionalnih medicinskih stručnjaka, bolnica pokriva širok spektar medicinskih oblasti.</p><p>Dostupne specijalnosti: ginekologija, gastroenterologija, kardiologija, onkologija, endokrinologija, urologija, neurologija, reumatologija, pulmologija, ortopedija, dermatovenerologija, psihijatrija, pedijatrija, ORL i fizikalna medicina. Laboratorij radi svaki dan 07–20h.</p>",
    address: "Bulevar vojvode Stepe Stepanovića 114, 78000 Banja Luka",
    lat: 44.7642, lng: 17.1983,
    phone: "+387 51 965 256", email: "budidobro@klinikabewell.com",
    status: "active", viewCount: 1650,
    _img: "https://images.pexels.com/photos/305567/pexels-photo-305567.jpeg?w=800",
  },
  {
    title: "Specijalna hirurška bolnica Dr Kostić – Banja Luka",
    companyName: "ZU Specijalna bolnica iz hirurških oblasti Dr Kostić",
    content: "<p>Specijalna hirurška bolnica Dr Kostić vodeća je privatna bolnica iz hirurških oblasti u Banja Luci i Republici Srpskoj. Osnivač i voditelj bolnice je prof. dr Branko Kostić, priznat hirurg s međunarodnim iskustvom.</p><p>Bolnica nudi usluge iz: opšte hirurgije, ortopedije i traumatologije, gastroenterologije (uključujući kolonoskopiju i gastroskopiju), urologije, plastične i rekonstruktivne hirurgije, te anestezije i reanimacije. Postoperativna njega provodi se u savremeno opremljenim bolničkim sobama.</p>",
    address: "Maksima Gorkog 9, 78000 Banja Luka",
    lat: 44.7736, lng: 17.1897,
    phone: "+387 51 491 999", email: "info@klinikakostic.com",
    status: "active", viewCount: 1340,
    _img: "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?w=800",
  },
  {
    title: "Alivia – specijalistički centar Banja Luka",
    companyName: "ZU Specijalistički centar Alivia Banja Luka",
    content: "<p>Alivia je moderni specijalistički medicinski centar u Banja Luci koji pokriva gotovo sve specijalnosti savremene medicine. Tim mladih i iskusnih ljekara specijalista pruža usluge uz primjenu najnovijih dijagnostičkih i terapeutskih metoda.</p><p>Specijalnosti: endokrinologija, ortopedija i traumatologija, vaskularna hirurgija, ginekologija, interna medicina, kardiologija, neurologija, pulmologija, te laboratorijska i ultrazvučna dijagnostika. Radno vrijeme: pon–pet 08–20h, sub 08–14h.</p>",
    address: "Kozarska 28, 78000 Banja Luka",
    lat: 44.7718, lng: 17.1875,
    phone: "+387 51 264 090", email: "info@alivia.ba",
    status: "active", viewCount: 1120,
    _img: "https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?w=800",
  },
  {
    title: "Bolnica Jelena – ginekologija, porodiljstvo i IVF, Banja Luka",
    companyName: "Bolnica Jelena d.o.o. Banja Luka",
    content: "<p>Bolnica Jelena je moderna privatna bolnica specijalizovana za žensko zdravlje, porodiljstvo i liječenje neplodnosti metodom in vitro fertilizacije (IVF). Bolnica raspolaže savremenim porodilištem, ginekološkom operacionom salom i IVF laboratorijem.</p><p>Usluge: ginekološki pregledi i dijagnostika, praćenje trudnoće i porodiljstvo, laparoskopska i histeroskopska hirurgija, tretmani neplodnosti i IVF, te estetska ginekologija. Tim stručnjaka dostupan je 24/7 za hitne slučajeve.</p>",
    address: "Jovana Dučića 47, 78000 Banja Luka",
    lat: 44.7705, lng: 17.1862,
    phone: "+387 51 302 676", email: "info@bolnicajelena.com",
    status: "active", viewCount: 1450,
    _img: "https://images.pexels.com/photos/3786154/pexels-photo-3786154.jpeg?w=800",
  },
  {
    title: "Talmma Medic – zdravstvena ustanova Banja Luka",
    companyName: "ZU Talmma Medic Banja Luka",
    content: "<p>Talmma Medic je specijalistički zdravstveni centar u Banja Luci koji pruža specijalističke preglede i dijagnostičke usluge iz više medicinskih oblasti uz individualni pristup svakom pacijentu.</p><p>Specijalnosti: endokrinologija, kardiologija, neurologija, ginekologija, hematologija, reumatologija, nefrologija, interna medicina, psihijatrija, vaskularna hirurgija, urologija, torakalna hirurgija, pulmologija i fizikalna medicina. Radno vrijeme: pon–pet 08–20h, sub 08–14h.</p>",
    address: "Bulevar vojvode Stepe Stepanovića 175c, 78000 Banja Luka",
    lat: 44.7635, lng: 17.2010,
    phone: "+387 51 925 125", email: "talmmamedic5@gmail.com",
    status: "active", viewCount: 890,
    _img: "https://images.pexels.com/photos/3786122/pexels-photo-3786122.jpeg?w=800",
  },
  {
    title: "Euromedic – specijalistički centar Banja Luka",
    companyName: "ZU SC Euromedic Banja Luka",
    content: "<p>Specijalistički centar Euromedic osnovan je 1997. godine i jedan je od pionira privatnog zdravstva u Banja Luci. Centar je opremljen savremenom PHILLIPS EnVisor ultrazvučnom aparaturom i nudi NMR dijagnostiku, te laboratorijske usluge.</p><p>Dostupne specijalnosti: internistička ambulanta, kardiologija s ultrazvukom srca, ginekologija, ortopedija, hirurška ambulanta, ORL, te laboratorij s punom biohemijskom i hematološkom dijagnostikom. Radno vrijeme: pon–pet 08–19h, sub 09–12h.</p>",
    address: "Brace Potkonjaka 23, 78000 Banja Luka",
    lat: 44.7755, lng: 17.1952,
    phone: "+387 51 463 025", email: "euromedik@blic.net",
    status: "active", viewCount: 760,
    _img: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?w=800",
  },
  {
    title: "Preventiva Medical – specijalistički centar Banja Luka",
    companyName: "Preventiva Medical d.o.o. Banja Luka",
    content: "<p>Preventiva Medical je specijalistički medicinski centar osnovan 2014. godine u Banja Luci, koji je od ambulante medicine rada prerastao u modernu polikliniku s više od 20 specijalističkih ambulanti.</p><p>Specijalnosti: dermatologija, neurologija, fizikalna medicina i rehabilitacija, oftalmologija, ginekologija, interna medicina, psihijatrija, kardiologija, reumatologija, ORL, endokrinologija te medicina rada. Radno vrijeme: pon–pet 07–19h, sub 08–12h.</p>",
    address: "Akademika Jovana Surutke 3, 78000 Banja Luka",
    lat: 44.7718, lng: 17.1903,
    phone: "+387 66 755 755", email: "preventivamedicalbl@gmail.com",
    status: "active", viewCount: 830,
    _img: "https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?w=800",
  },
  {
    title: "Medical Group – specijalna hirurška bolnica Banja Luka",
    companyName: "Specijalna hirurška bolnica Medical Group Banja Luka",
    content: "<p>Medical Group je jedna od najsavremenije opremljenih privatnih bolnica u regiji, smještena u Banja Luci. Bolnica raspolaže s 11 medicinskih centara i 14 medicinskih kabineta u kojima rade više od 60 doktora, hirurga i specijalista.</p><p>Centar pruža kompletnu medicinsku uslugu: od dijagnostičkih procedura i specijalističkih pregleda do hirurških intervencija i cjelokupnog liječenja. Posebno su razvijeni centri za minimalno invazivnu hirurgiju, onkologiju i ortopediju.</p>",
    address: "Knjaza Miloša 81, 78000 Banja Luka",
    lat: 44.7748, lng: 17.1920,
    phone: "+387 51 818 818", email: "info@medicalgroup.ba",
    status: "active", viewCount: 1050,
    _img: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=800",
  },
  {
    title: "Deamedica – specijalistički centar Banja Luka",
    companyName: "ZU Specijalistički centar Deamedica Banja Luka",
    content: "<p>Deamedica je specijalistički medicinski centar u Banja Luci koji nudi visokokvalitetne specijalističke usluge i dijagnostiku iz više od 20 medicinskih oblasti. Centar raspolaže savremenom laboratorijskom i ultrazvučnom opremom.</p><p>Specijalnosti: interna medicina, kardiologija, ginekologija, ORL, fizikalna medicina i rehabilitacija, dermatologija, endokrinologija, neurologija, te laboratorijska dijagnostika. Radno vrijeme: pon–pet 07–20h, sub 07–15h.</p>",
    address: "Pave Radana 57, 78000 Banja Luka",
    lat: 44.7710, lng: 17.1935,
    phone: "+387 51 309 222", email: "info@deamedica.ba",
    status: "active", viewCount: 690,
    _img: "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg?w=800",
  },
  {
    title: "Cormedic – kardiološka ordinacija Banja Luka",
    companyName: "ZU Cormedic – Ordinacija za bolesti srca i krvnih sudova",
    content: "<p>Cormedic je specijalistička kardiološko-internistička ordinacija u Banja Luci pod vodstvom dr Gorana Samardžije, specijaliste interne medicine i kardiologije s dugogodišnjim kliničkim iskustvom.</p><p>Usluge: specijalističke internističke i kardiološke konsultacije, EKG, ultrazvuk srca (ehokardiografija), ergometrija (test opterećenja), Holter EKG i krvnog pritiska, te angiološka dijagnostika krvnih sudova. Prevencija i liječenje bolesti srca, hipertenzije i ateroskleroze.</p>",
    address: "Petra Mećave bb, 78000 Banja Luka",
    lat: 44.7728, lng: 17.1870,
    phone: "+387 51 962 612", email: "info@cormedicbl.com",
    status: "active", viewCount: 580,
    _img: "https://images.pexels.com/photos/208518/pexels-photo-208518.jpeg?w=800",
  },
  {
    title: "Specijalistički centar Devet Doktora – Banja Luka",
    companyName: "ZU Specijalistički centar Devet Doktora Banja Luka",
    content: "<p>Specijalistički centar Devet Doktora u Banja Luci nudi multidisciplinarnu medicinsku skrb pod jednim krovom. Centar je prepoznatljiv po specijalnosti ORL s dijagnostikom poremećaja ravnoteže i sluha, te po modernoj stomatološkoj ordinaciji.</p><p>Specijalnosti: ORL, neurologija, kardiologija, gastroenterologija, nefrologija, pedijatrija, pulmologija, urologija, psihologija, stomatologija (konzervativa, protetika, ortodoncija), UZ dijagnostika i laboratorij. Brzi antigen testovi dostupni bez narudžbe.</p>",
    address: "Petra Preradovića 27, 78000 Banja Luka",
    lat: 44.7744, lng: 17.1908,
    phone: "+387 51 313 555", email: "specijalisticki-centar@9doktora.com",
    status: "active", viewCount: 720,
    _img: "https://images.pexels.com/photos/1366942/pexels-photo-1366942.jpeg?w=800",
  },
  {
    title: "ZU Dr ArAr – dijagnostički centar Banja Luka",
    companyName: "ZU SC Dr ArAr Banja Luka",
    content: "<p>Zdravstvena ustanova Specijalistički centar Dr ArAr djeluje od 1999. godine u Banja Luci kao vodeći centar za radiološku i neurološku dijagnostiku u Republici Srpskoj. Osnivač i direktor je Darko Arar.</p><p>Usluge: CT dijagnostika, MR dijagnostika (magnetna rezonanca), ultrazvučna dijagnostika (UZ), RTG, mamografija, ORTOPAN, digitalni EEG, EMNG (elektromijeloneurografija), te centrovaskularna preventivna dijagnostika. Od 2021. dostupne su i usluge neurologije.</p>",
    address: "Karađorđeva 2, 78000 Banja Luka",
    lat: 44.7780, lng: 17.1850,
    phone: "+387 51 219 777", email: "info@drarar.ba",
    status: "active", viewCount: 650,
    _img: "https://images.pexels.com/photos/1366944/pexels-photo-1366944.jpeg?w=800",
  },
  {
    title: "Prof. dr Aleksandar Lazarević – ambulanta interne medicine Banja Luka",
    companyName: "ZU Prof. dr Aleksandar Lazarević – Ambulanta interne medicine",
    content: "<p>Privatna ambulanta interne medicine prof. dr Aleksandra Lazarevića u Banja Luci nudi specijalističke internističke preglede, konzultacije i praćenje kroničnih oboljenja pod vodstvom iskusnog profesora i specijaliste.</p><p>Usluge: internistički pregledi, kardiološka dijagnostika (EKG, ehokardiografija), ultrazvuk abdomena, laboratorijske analize, praćenje i liječenje dijabetesa, hipertenzije, bolesti štitne žlijezde i ostalih internih oboljenja.</p>",
    address: "Pave Radana 17, 78000 Banja Luka",
    lat: 44.7712, lng: 17.1940,
    phone: "+387 51 346 400", email: "ordinacija@dr-lazarevic.com",
    status: "active", viewCount: 490,
    _img: "https://images.pexels.com/photos/5664736/pexels-photo-5664736.jpeg?w=800",
  },
  {
    title: "Orthosport – ortopedska sportska ambulanta Banja Luka",
    companyName: "ZU Ortopedska sportska ambulanta Orthosport Banja Luka",
    content: "<p>Orthosport je specijalizovana privatna ortopedska sportska ambulanta u Banja Luci, namijenjena liječenju sportskih povreda, ortopedskih oboljenja i rehabilitaciji. Posebna pažnja posvećuje se sportistima i aktivnim osobama.</p><p>Usluge: ortopedski specijalstički pregledi, dijagnostika i liječenje sportskih povreda (istegnuća, uganuća, prijelomi), ultrazvuk mišićno-koštanog sistema, PRP terapija, te fizikalna medicina i rehabilitacija. Radno vrijeme: pon–pet 08–20h, sub 08–13h.</p>",
    address: "Kralja Alfonsa XIII 49a, 78000 Banja Luka",
    lat: 44.7760, lng: 17.1860,
    phone: "+387 66 900 385", email: "info@orthosportstudio.com",
    status: "active", viewCount: 540,
    _img: "https://images.pexels.com/photos/7615574/pexels-photo-7615574.jpeg?w=800",
  },
  {
    title: "MonDent – stomatološka ordinacija Banja Luka",
    companyName: "Stomatološka ordinacija MonDent Banja Luka",
    content: "<p>MonDent je moderna stomatološka ordinacija u Banja Luci, poznata kao prva stomatološka klinika s njemačkim standardima na području BiH i Republike Srpske. Klinika nudi kompletne dentalne usluge uz primjenu najnovijih materijala i tehnologija.</p><p>Usluge: konzervativna stomatologija (plombiranje, endodoncija), estetska stomatologija (bijeljenje, keramičke ljuskice), implantoprotetika, oralna hirurgija, parodontologija, te rendgenska dijagnostika. Radno vrijeme: pon–pet 08–18h.</p>",
    address: "Milana Radmana 47, 78000 Banja Luka",
    lat: 44.7735, lng: 17.1975,
    phone: "+387 51 240 677", email: "info@mondent.ba",
    status: "active", viewCount: 430,
    _img: "https://images.pexels.com/photos/7615618/pexels-photo-7615618.jpeg?w=800",
  },
  {
    title: "Elite Dent – centar za estetsku stomatologiju Banja Luka",
    companyName: "Stomatološka ordinacija Elite Dent Banja Luka",
    content: "<p>Elite Dent je centar za estetsku stomatologiju i implantoprotetiku u Banja Luci, specijaliziran za vrhunska dentalna rješenja uz upotrebu najmodernijih materijala i digitalne tehnologije u stomatologiji.</p><p>Usluge: estetska stomatologija (keramičke ljuskice, bijeljenje), implantologija i implantoprotetika, digitalno planiranje liječenja, konzervativna stomatologija, protetika (krunice, mostovi) i oralna hirurgija. Naručivanje termina putem telefona ili Instagram stranice.</p>",
    address: "Jovana Dučića 74c, 78000 Banja Luka",
    lat: 44.7705, lng: 17.1865,
    phone: "+387 65 800 700", email: "info@elite-dent.com",
    status: "active", viewCount: 380,
    _img: "https://images.pexels.com/photos/8410647/pexels-photo-8410647.jpeg?w=800",
  },
  {
    title: "BL Dental – stomatološka ordinacija Banja Luka",
    companyName: "Stomatološka ordinacija BL Dental Banja Luka",
    content: "<p>BL Dental je stomatološka ordinacija u Banja Luci s dugogodišnjom tradicijom i iskustvom u pružanju kvalitetnih dentalnih usluga pacijentima svih uzrasta. Klinika je opremljena savremenom digitalnom RTG aparaturom.</p><p>Usluge: konzervativna stomatologija, endodoncija (liječenje korijenskih kanala), estetska stomatologija, protetika (fiksna i mobilna), parodontologija, oralna hirurgija, te pedijatrijska stomatologija. Radno vrijeme: pon–pet 08–18h, sub po dogovoru.</p>",
    address: "Tuzlanska 46H, 78000 Banja Luka",
    lat: 44.7768, lng: 17.1930,
    phone: "+387 51 420 441", email: "bastasic@gmail.com",
    status: "active", viewCount: 310,
    _img: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?w=800",
  },
  {
    title: "ZU Ginea – ginekološka ordinacija Banja Luka",
    companyName: "ZU Ginea – Ginekološka ordinacija Banja Luka",
    content: "<p>ZU Ginea je privatna ginekološka ordinacija u Banja Luci koja pruža kompletnu ginekološku skrb za žene svih uzrasta, od preventivnih pregleda do liječenja ginekoloških oboljenja.</p><p>Usluge: redovni ginekološki pregledi, citološki brisevi (Papa test), colposcopia, ultrazvuk male zdjelice i dojke, planiranje porodice, praćenje trudnoće, te dijagnostika i liječenje ginekoloških infekcija i hormonskih poremećaja.</p>",
    address: "Ul. Jasenovačkih logoraša 9, 78000 Banja Luka",
    lat: 44.7695, lng: 17.1990,
    phone: "+387 65 926 060", email: "zuginea@gmail.com",
    status: "active", viewCount: 360,
    _img: "https://images.pexels.com/photos/5049242/pexels-photo-5049242.jpeg?w=800",
  },

  // ─── SARAJEVO (21–40) ─────────────────────────────────────────────────────
  {
    title: "ASA Hospital – prva privatna opća bolnica Sarajevo",
    companyName: "ASA Bolnica d.o.o. Sarajevo",
    content: "<p>ASA Hospital je prva i vodeća privatna opća bolnica u Sarajevu i Bosni i Hercegovini, smještena u modernom objektu na Otoci. Bolnica nudi kompletnu bolničku i specijalističku medicinsku skrb uz 24-satni dežurni servis.</p><p>Usluge: hitna medicina, interna medicina, hirurgija, ginekologija, pedijatrija, oftalmologija, neurologija, ortopedija, dermatologija, psihijatrija, radiologija, laboratorij i brojne druge specijalnosti. Kontakt centar: 0800 222 55 (besplatno). Radno vrijeme: pon–pet 08–20h, hitna 24/7.</p>",
    address: "Džemala Bijedića 127, 71000 Sarajevo",
    lat: 43.8214, lng: 18.3601,
    phone: "+387 33 555 200", email: "info@asabolnica.ba",
    status: "active", viewCount: 2350,
    _img: "https://images.pexels.com/photos/16571733/pexels-photo-16571733.jpeg?w=800",
  },
  {
    title: "Poliklinika Atrijum – Sarajevo",
    companyName: "Poliklinika Atrijum d.o.o. Sarajevo",
    content: "<p>Poliklinika Atrijum je jedna od vodećih i najopremljenih privatnih poliklinika u Sarajevu, osnovana 1998. godine. Smještena je u Avaz Business Centru i nudi kompletnu specijalističku i dijagnostičku skrb.</p><p>Specijalnosti: opća i porodična medicina, interna medicina, kardiologija, pulmologija, endokrinologija i dijabetologija, neuropsihijatrija, oftalmologija, fizikalna medicina i rehabilitacija, psihologija, radiologija te laboratorij. Radno vrijeme: pon–pet 08–20h, sub 08–14h.</p>",
    address: "Džemala Bijedića 185 (Avaz Business Center), 71000 Sarajevo",
    lat: 43.8220, lng: 18.3610,
    phone: "+387 33 467 444", email: "info@poliklinika-atrijum.ba",
    status: "active", viewCount: 1820,
    _img: "https://images.pexels.com/photos/9742745/pexels-photo-9742745.jpeg?w=800",
  },
  {
    title: "Poliklinika SaNaSa – Sarajevo",
    companyName: "ZU SaNaSa d.o.o. Sarajevo",
    content: "<p>Poliklinika SaNaSa je prvi privatni medicinski centar u Sarajevu, osnovan u junu 1999. godine. Sa tri lokacije (Grbavica, Ilidža, Vogošća), SaNaSa pokriva široko područje Sarajevskog kantona i nudi kompletnu medicinsku skrb.</p><p>Specijalnosti: interna medicina, kardiologija, radiologija, dermatologija, stomatologija, urologija, neurologija, opšta hirurgija, pulmologija, gastroenterologija, ginekologija, ORL, oftalmologija, ortopedija, endokrinologija, psihologija te laboratorij (biohemija, hematologija, mikrobiologija, imunologija).</p>",
    address: "Grbavička 74, 71000 Sarajevo",
    lat: 43.8440, lng: 18.3920,
    phone: "+387 33 661 840", email: "info@poliklinikasanasa.com",
    status: "active", viewCount: 1640,
    _img: "https://images.pexels.com/photos/3873149/pexels-photo-3873149.jpeg?w=800",
  },
  {
    title: "Poliklinika Agram – Sarajevo",
    companyName: "Poliklinika Agram d.o.o. Sarajevo",
    content: "<p>Poliklinika Agram je renomirana privatna poliklinika u Sarajevu koja pruža visokokvalitetne specijalističke i dijagnostičke usluge. Poliklinika je smještena na Novom Sarajevu i raspolaže modernom laboratorijskom i radiološkom opremom.</p><p>Specijalnosti: interna medicina, hirurgija, citologija, radiologija, ORL, ginekologija, urologija, neurologija, medicina rada, oftalmologija, dermatovenerologija, pedijatrija, ortopedija, psihijatrija, fizikalna medicina i rehabilitacija te laboratorij. Radno vrijeme: pon–sub 08–15h.</p>",
    address: "Trg međunarodnog prijateljstva 20, 71000 Sarajevo",
    lat: 43.8410, lng: 18.3970,
    phone: "+387 33 755 547", email: "agram@poliklinika-agram.ba",
    status: "active", viewCount: 1230,
    _img: "https://images.pexels.com/photos/3683040/pexels-photo-3683040.jpeg?w=800",
  },
  {
    title: "Poliklinika Dr Nabil – specijalistički medicinski centar Sarajevo",
    companyName: "PZU Poliklinika Dr Nabil Sarajevo",
    content: "<p>Poliklinika Dr. Nabil je vodeći specijalistički medicinski centar u Sarajevu s multidisciplinarnim timom vrhunskih ljekara i specijalista iz različitih medicinskih oblasti. Poliklinika je smještena na Otoci, uz Bulevar Meše Selimovića.</p><p>Specijalnosti: kardiologija, ginekologija, endokrinologija, interna medicina, ultrazvučna dijagnostika i laboratorij. Poliklinika nudi preventivne medicinske pakete za pravovremeno otkrivanje oboljenja. Radno vrijeme: pon–pet 08–18h, sub 08–12h.</p>",
    address: "Bulevar Meše Selimovića 2B, 71000 Sarajevo",
    lat: 43.8470, lng: 18.3695,
    phone: "+387 33 777 711", email: "poliklinika.nabil@bih.net.ba",
    status: "active", viewCount: 1150,
    _img: "https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?w=800",
  },
  {
    title: "Poliklinika Medical Centar – Sarajevo",
    companyName: "Poliklinika Medical Centar d.o.o. Sarajevo",
    content: "<p>Poliklinika Medical Centar Sarajevo je jedan od najopremljenih dijagnostičkih centara u Bosni i Hercegovini, otvoren 2019. godine na adresi Alipašina 45b. Centar je dio mreže poliklinika prisutnih u nekoliko gradova BiH.</p><p>Specijalnosti: ginekologija, urologija, neurologija, pedijatrija, endokrinologija, ortopedija i kardiologija, uz modernu radiološku dijagnostiku (MRI, CT, mamografija). Naručivanje termina putem call centra ili online platforme.</p>",
    address: "Alipašina 45b, 71000 Sarajevo",
    lat: 43.8600, lng: 18.3890,
    phone: "+387 33 940 940", email: "info@medical-centar.ba",
    status: "active", viewCount: 1090,
    _img: "https://images.pexels.com/photos/3652701/pexels-photo-3652701.jpeg?w=800",
  },
  {
    title: "Moja Klinika – Sarajevo",
    companyName: "Moja Klinika d.o.o. Sarajevo",
    content: "<p>Moja Klinika je moderna privatna zdravstvena ustanova u centru Sarajeva koja nudi specijalističke preglede, dijagnostičke usluge i palijativnu skrb. Klinika je poznata po humanom pristupu i pažnji prema pacijentima.</p><p>Usluge: specijalističke konsultacije iz interne medicine, kardiologije i neurologije, ultrazvučna i laboratorijska dijagnostika, te hospis usluge (palijativna skrb) na lokaciji Blažuj. Naručivanje termina putem telefona ili e-maila. Radno vrijeme: pon–pet 08–17h.</p>",
    address: "Kolodvorska 12a, 71000 Sarajevo",
    lat: 43.8591, lng: 18.4241,
    phone: "+387 33 942 640", email: "info@mojaklinika.ba",
    status: "active", viewCount: 820,
    _img: "https://images.pexels.com/photos/9902135/pexels-photo-9902135.jpeg?w=800",
  },
  {
    title: "Sara-Vita – poliklinika za ginekologiju i estetsku hirurgiju Sarajevo",
    companyName: "PZU Poliklinika Sara-Vita Sarajevo",
    content: "<p>Poliklinika Sara-Vita specijalizirana je za ginekologiju, perinatologiju i estetsku hirurgiju u Sarajevu. Smještena je u Importanne Centru uz Vilsonovo šetalište. Vlasnica i voditeteljica poliklinike je Prim. dr Emina Sarajlija-Pavlović, specijalista ginekolog i perinatolog.</p><p>Usluge: ginekološki pregledi i dijagnostika, praćenje trudnoće i perinatalna skrb, laparoskopska i histeroskopska hirurgija, estetska i rekonstruktivna hirurgija (abdominoplastika, augmentacija dojki, liposukcija) te postoperativna njega.</p>",
    address: "Zmaja od Bosne 7/III (Importanne Centar), 71000 Sarajevo",
    lat: 43.8546, lng: 18.4049,
    phone: "+387 33 973 441", email: "info@sara-vita.com",
    status: "active", viewCount: 940,
    _img: "https://images.pexels.com/photos/5863359/pexels-photo-5863359.jpeg?w=800",
  },
  {
    title: "Poliklinika Dr Odobašić – Sarajevo",
    companyName: "PZU Poliklinika Dr Odobašić Sarajevo",
    content: "<p>PZU Poliklinika Dr. Odobašić je ugledna privatna poliklinika u Sarajevu specijalizovana za internu medicinu i kardiologiju s dugogodišnjom tradicijom i vrhunskim timom stručnjaka.</p><p>Usluge: opća interna medicina, kardiologija, gastroenterohepatologija, angiologija, ultrazvučna dijagnostika abdomena i srca, te specijalistička dijagnostika s vlastitim laboratorijem. Poliklinika nudi i uslugu kućnih posjeta za pokretne pacijente. Radno vrijeme: pon–pet 08–16h.</p>",
    address: "Omladinskih radnih brigada 8/1, 71000 Sarajevo",
    lat: 43.8570, lng: 18.3990,
    phone: "+387 33 766 630", email: "poliklinika.dr.odobasic@live.com",
    status: "active", viewCount: 730,
    _img: "https://images.pexels.com/photos/3844581/pexels-photo-3844581.jpeg?w=800",
  },
  {
    title: "Naša mala klinika – centar za estetsku hirurgiju Sarajevo",
    companyName: "Naša mala klinika d.o.o. Sarajevo",
    content: "<p>Naša mala klinika je specijalizirani centar za estetsku, plastičnu i rekonstruktivnu hirurgiju u Sarajevu, osnovan 2011. godine. Klinika je prepoznata kao jedno od vodećih estetskih hirurških centara u regiji jugoistočne Evrope.</p><p>Usluge: estetska hirurgija lica i tijela (rinoplastika, blefaroplastika, augmentacija i lifting dojki, abdominoplastika, liposukcija), rekonstruktivna hirurgija, minimalno invazivne estetske procedure (botoks, fileri) te konzultacije i postoperativno praćenje.</p>",
    address: "Adila Grebe bb, 71000 Sarajevo",
    lat: 43.8556, lng: 18.4139,
    phone: "+387 33 222 212", email: "info@nasamalaklinika.net",
    status: "active", viewCount: 1070,
    _img: "https://images.pexels.com/photos/32026163/pexels-photo-32026163.jpeg?w=800",
  },
  {
    title: "Klinika Svjetlost – bolnica za oftalmologiju Sarajevo",
    companyName: "Klinika Svjetlost Sarajevo d.o.o.",
    content: "<p>Klinika Svjetlost je specijalizirana privatna bolnica za oftalmologiju u Sarajevu, smještena u Ilidži. Dio je renomirane grupacije Svjetlost prisutne u više zemalja regije. Klinika je opremljena najsavremenijom oftalmološkom opremom i operacionim salama.</p><p>Usluge: laserska korekcija vida (LASIK, PRK), kirurgija katarakte s implantacijom premijum leća, liječenje glaukoma, vitreoretinalna hirurgija, dijagnostika i liječenje strabizma (posebno kod djece), te kompletna oftalmološka dijagnostika. Radno vrijeme: pon–čet 08–20h, pet 08–18h.</p>",
    address: "Dr. Mustafe Pintola 23, 71000 Sarajevo (Ilidža)",
    lat: 43.8320, lng: 18.3140,
    phone: "+387 33 762 772", email: "info@svjetlost-sarajevo.ba",
    status: "active", viewCount: 1380,
    _img: "https://images.pexels.com/photos/13083355/pexels-photo-13083355.jpeg?w=800",
  },
  {
    title: "Plava Medical Group – poliklinika Sarajevo",
    companyName: "PZU Plava Medical Group – Podružnica Sarajevo",
    content: "<p>Plava Medical Group je privatna zdravstvena ustanova s više od 200 zaposlenika i prisutnošću u šest gradova BiH. Sarajevska podružnica smještena je na Trgu nezavisnosti i nudi multidisciplinarnu specijalističku skrb u više od 40 medicinskih oblasti.</p><p>Specijalnosti: interna medicina, ginekologija, urologija (laparoskopske metode), estetska hirurgija (augmentacija dojki, liposukcija, abdominoplastika), liječenje neplodnosti i IVF, radiologija, laboratorij i laboratorijska dijagnostika.</p>",
    address: "Trg nezavisnosti 28, 71000 Sarajevo",
    lat: 43.8500, lng: 18.3920,
    phone: "+387 33 463 888", email: "info@plavapoliklinika.ba",
    status: "active", viewCount: 1160,
    _img: "https://images.pexels.com/photos/7108390/pexels-photo-7108390.jpeg?w=800",
  },
  {
    title: "Neuropraxis – privatna neurološka ordinacija Sarajevo",
    companyName: "Neuropraxis – Privatna neurološka ordinacija Sarajevo",
    content: "<p>Neuropraxis je specijalistička privatna neurološka ordinacija u Sarajevu, pod vodstvom prof. prim. dr. Merite Tirić-Čampare, primarijusa i doktora medicinskih nauka, specijaliste neuropsihijatrije s dugogodišnjim kliničkim i naučnim iskustvom.</p><p>Usluge: dijagnostika i liječenje glavobolja i migrena, cerebrovaskularne bolesti (moždani udar, TIA), oboljenja kičmene moždine, multiple skleroze, Parkinsonove bolesti, epilepsije, demencije i ostalih neuroloških i neuropsihijatrijskih stanja. EEG i EMNG dijagnostika.</p>",
    address: "Trg Heroja 7, 71000 Sarajevo",
    lat: 43.8590, lng: 18.4130,
    phone: "+387 62 210 700", email: "neuropraxis.sarajevo@gmail.com",
    status: "active", viewCount: 650,
    _img: "https://images.pexels.com/photos/7108421/pexels-photo-7108421.jpeg?w=800",
  },
  {
    title: "Pedijatrijska ordinacija Suncokret – Sarajevo",
    companyName: "Pedijatrijska ordinacija Suncokret Sarajevo",
    content: "<p>Pedijatrijska ordinacija Suncokret je renomirana privatna pedijatrijska ordinacija u Sarajevu, specijalizovana za zdravlje djece od novorođenačke dobi do 18 godina. Tim pedijatara pruža kompletnu preventivnu i kurativnu pedijatriju.</p><p>Usluge: sistematski i preventivni pregledi djece, vakcinacija, dijagnostika i liječenje akutnih i kroničnih bolesti kod djece, ultrazvuk kukova i novorođenačka dijagnostika, savjetovanje roditelja o ishrani i razvoju djeteta, te hitan pedijatrijski pregled. Radno vrijeme: pon–pet 08–17h.</p>",
    address: "Muhameda ef. Pandže 67, 71000 Sarajevo",
    lat: 43.8580, lng: 18.3700,
    phone: "+387 33 266 266", email: "ordinacija@pedijatrija-suncokret.ba",
    status: "active", viewCount: 790,
    _img: "https://images.pexels.com/photos/8940467/pexels-photo-8940467.jpeg?w=800",
  },
  {
    title: "Euro Dental Centar – stomatološka ordinacija Sarajevo",
    companyName: "Euro Dental Centar d.o.o. Sarajevo",
    content: "<p>Euro Dental Centar je moderna stomatološka ordinacija u Sarajevu koja nudi kompletne dentalne usluge uz primjenu najnovijih materijala i tehnologija. Klinika je opremljena digitalnom radiografijom i CAD/CAM sistemom za izradu keramičkih restauracija.</p><p>Usluge: konzervativna stomatologija, estetska stomatologija (bijeljenje, veneers), implantologija i implantoprotetika, protetika (krunice, mostovi, proteze), ortodoncija (fiksni i mobilni aparati), parodontologija, oralna kirurgija i dječja stomatologija. Radno vrijeme: pon–pet 08–19h, sub 08–13h.</p>",
    address: "Zmaja od Bosne 74, 71000 Sarajevo",
    lat: 43.8542, lng: 18.3980,
    phone: "+387 33 201 020", email: "info@eurodentalcentar.ba",
    status: "active", viewCount: 570,
    _img: "https://images.pexels.com/photos/8940524/pexels-photo-8940524.jpeg?w=800",
  },
  {
    title: "Poliklinika Dr Seftić – Sarajevo",
    companyName: "Ordinacija dr Seftić d.o.o. Sarajevo",
    content: "<p>Ordinacija dr. Seftić je privatna specijalistička ordinacija na Ferhadiji u centru Sarajeva, poznata po visokim standardima medicinske skrbi i individualnom pristupu svakom pacijentu.</p><p>Usluge: specijalističke internističke konsultacije, kardiološka dijagnostika, ultrazvučna dijagnostika i laboratorijske pretrage. Ordinacija je ugovorni partner brojnih zdravstvenih osiguravajućih kuća u BiH. Radno vrijeme: pon–pet 09–17h.</p>",
    address: "Ferhadija 5, 71000 Sarajevo",
    lat: 43.8599, lng: 18.4299,
    phone: "+387 33 210 212", email: "ordinacija.seftic@gmail.com",
    status: "active", viewCount: 490,
    _img: "https://images.pexels.com/photos/4226912/pexels-photo-4226912.jpeg?w=800",
  },
  {
    title: "Kardiocentar – poliklinika Sarajevo",
    companyName: "Poliklinika Kardiocentar Sarajevo",
    content: "<p>Poliklinika Kardiocentar u Sarajevu je specijalistička kardiološka ustanova s modernom dijagnostičkom opremom za kompleksnu kardiološku obradu i praćenje bolesti srca i krvnih sudova.</p><p>Usluge: specijalističke internističke i kardiološke konsultacije, EKG, ehokardiografija, ergometrija, Holter EKG i Holter krvnog pritiska, tilt-table test, MSCT koronarna angiografija, vaskularna ultrazvučna dijagnostika te laboratorij s kompletnim kardiološkim markerima.</p>",
    address: "Skenderija Kranjčevića 12, 71000 Sarajevo",
    lat: 43.8580, lng: 18.4210,
    phone: "+387 62 408 444", email: "kardiocentar.sarajevo@gmail.com",
    status: "active", viewCount: 720,
    _img: "https://images.pexels.com/photos/287237/pexels-photo-287237.jpeg?w=800",
  },
  {
    title: "Dermatološka ordinacija Dr Mutevelić-Eminagić – Sarajevo",
    companyName: "PZU Dermatoveneroloska ordinacija Dr Mutevelić-Eminagić",
    content: "<p>Privatna dermatovenereološka ordinacija dr. Amre Mutevelić-Eminagić je specijalistička klinika u Sarajevu posvećena dijagnostici i liječenju kožnih bolesti i bolesti spolno prenosivih infekcija.</p><p>Usluge: dermatološki pregledi, liječenje dermatitisa, ekcema, psorijaze, akni, urtikarije i ostalih kožnih bolesti, dermatoskopija i pregled mladeža, venereološka dijagnostika, estetska dermatologija (botoks, fileri, kemijski pilinzi, laserski tretmani), te alergološka testiranja. Radno vrijeme: pon–pet 09–17h.</p>",
    address: "Zagrebačka 27, 71000 Sarajevo",
    lat: 43.8530, lng: 18.3865,
    phone: "+387 33 207 500", email: "dermatologija.eminagic@gmail.com",
    status: "active", viewCount: 610,
    _img: "https://images.pexels.com/photos/6812479/pexels-photo-6812479.jpeg?w=800",
  },
  {
    title: "AV Pediatric – pedijatrijski subspecijalistički centar Sarajevo",
    companyName: "AV Pediatric – Privatni pedijatrijski centar",
    content: "<p>AV Pediatric je regionalni privatni pedijatrijski subspecijalistički centar koji pruža visokokvalitetnu pedijatrijsku skrb djeci s akutnim i kroničnim oboljenjima. Centar je posebno specijaliziran za pedijatrijske subspecijalnosti.</p><p>Usluge: pedijatrijski subspecijalistički pregledi, dječja endokrinologija, pedijatrijska pulmologija, pedijatrijska gastroenterologija, neonatologija, preventivni pregledi i vakcinacija, te hitni pedijatrijski pregledi uz kućne posjete po dogovoru.</p>",
    address: "Branilaca Sarajeva 27, 71000 Sarajevo",
    lat: 43.8560, lng: 18.4000,
    phone: "+387 65 931 582", email: "info@avpediatric.ba",
    status: "active", viewCount: 530,
    _img: "https://images.pexels.com/photos/6812453/pexels-photo-6812453.jpeg?w=800",
  },
  {
    title: "Poliklinika Gežo – Dobrinja, Sarajevo",
    companyName: "PZU Poliklinika Dr Gežo Sarajevo",
    content: "<p>Poliklinika Dr. Gežo je privatna specijalistička poliklinika u novosarajevskom naselju Dobrinja, koja stanovnicima tog dijela grada pruža dostupnu i kvalitetnu medicinsku skrb bez potrebe za putovanjem u centar.</p><p>Specijalnosti: opća i porodična medicina, interna medicina, kardiologija, ginekologija, pedijatrija, ultrazvučna dijagnostika i laboratorij. Poliklinika je poznata po kratkim vremenima čekanja i pristupačnim cijenama usluga. Radno vrijeme: pon–pet 08–18h.</p>",
    address: "Mustafe Kamerića 10, Dobrinja, 71000 Sarajevo",
    lat: 43.8185, lng: 18.3120,
    phone: "+387 33 450 102", email: "info@poliklinikagezo.ba",
    status: "active", viewCount: 460,
    _img: "https://images.pexels.com/photos/35438269/pexels-photo-35438269.jpeg?w=800",
  },

  // ─── MOSTAR (41–44) ───────────────────────────────────────────────────────
  {
    title: "Poliklinika Vitalis – Mostar",
    companyName: "Poliklinika Vitalis d.o.o. Mostar",
    content: "<p>Poliklinika Vitalis je vodeća privatna zdravstvena ustanova u Mostaru i Hercegovini, poznata po vrhunskim dijagnostičkim kapacitetima uključujući magnetnu rezonancu 3 Tesla – jednu od najjačih u regiji.</p><p>Specijalnosti: interna medicina, pedijatrija, ginekologija, dermatologija, laboratorij, mikrobiologija, fizikalna medicina i rehabilitacija. Dijagnostika uključuje: 3T MRI, MSCT, RTG, mamografija, ultrazvuk i laboratorijska dijagnostika. Radno vrijeme: pon–pet 08–20h, sub 08–13h.</p>",
    address: "Vukovarska bb, 88000 Mostar",
    lat: 43.3488, lng: 17.8052,
    phone: "+387 36 310 210", email: "info@poliklinikavitalis.com",
    status: "active", viewCount: 1080,
    _img: "https://images.pexels.com/photos/532786/pexels-photo-532786.jpeg?w=800",
  },
  {
    title: "Prva Poliklinika Mostar",
    companyName: "Prva Poliklinika d.o.o. Mostar",
    content: "<p>Prva Poliklinika Mostar otvorena je s misijom da građanima Mostara i Hercegovine pruži najkvalitetniju dijagnostiku i liječenje iz više medicinskih oblasti. Sa timom od 30+ ljekara specijalista i subspecijalista, poliklinika je brzo postala referentna ustanova u regiji.</p><p>Specijalnosti: interna medicina, kardiologija, neurologija, ginekologija, endokrinologija, gastroenterologija i urologija. Poliklinika radi radnim danima 07–21h i subotom 08–12h. Naručivanje termina putem telefona ili web stranice.</p>",
    address: "M. Tita 235, 88000 Mostar",
    lat: 43.3438, lng: 17.8082,
    phone: "+387 36 842 842", email: "info@prvapoliklinika.ba",
    status: "active", viewCount: 910,
    _img: "https://images.pexels.com/photos/69686/pexels-photo-69686.jpeg?w=800",
  },
  {
    title: "Medical d.o.o. – poliklinika Mostar",
    companyName: "Medical d.o.o. Mostar",
    content: "<p>Medical d.o.o. je privatna zdravstvena ustanova u Mostaru koja nudi specijalističke preglede, dijagnostičke usluge i laboratorijsku obradu pacijenata. Klinika je moderna i opremljena savremenom medicinskom opremom.</p><p>Usluge: specijalističke konsultacije iz interne medicine, kardiologije, ginekologije i neurologije, ultrazvučna dijagnostika, laboratorij s kompletnom biohemijskom i hematološkom analizom, te preventivni medicinski paketi. Radno vrijeme: pon–pet 08–18h.</p>",
    address: "Kralja Zvonimira 12, 88000 Mostar",
    lat: 43.3450, lng: 17.8090,
    phone: "+387 36 312 400", email: "info@medical.ba",
    status: "active", viewCount: 670,
    _img: "https://images.pexels.com/photos/4269276/pexels-photo-4269276.jpeg?w=800",
  },
  {
    title: "Poliklinika Endo Plus – Mostar",
    companyName: "Poliklinika Endo Plus d.o.o. Mostar",
    content: "<p>Poliklinika Endo Plus je privatna specijalistička zdravstvena ustanova u Mostaru, specijalizovana za endokrinologiju i internu medicinu, s proširenom ponudom dijagnostičkih i specijalističkih usluga.</p><p>Usluge: endokrinološke konsultacije (dijabetes, bolesti štitne žlijezde, nadbubrežnih žlijezda), internistički pregledi, kardiološka dijagnostika, ultrazvučna dijagnostika, laboratorijske analize s hormonskim profilom i kompletna metabolička obrada. Radno vrijeme: pon–pet 08–18h.</p>",
    address: "Alekse Šantića 4, 88000 Mostar",
    lat: 43.3462, lng: 17.8075,
    phone: "+387 36 580 150", email: "info@poliklinikaendoplus.com",
    status: "active", viewCount: 560,
    _img: "https://images.pexels.com/photos/20140041/pexels-photo-20140041.jpeg?w=800",
  },

  // ─── TUZLA (45–48) ────────────────────────────────────────────────────────
  {
    title: "Medical Institute Bayer (MIB) – Tuzla",
    companyName: "Medical Institute Bayer d.o.o. Tuzla",
    content: "<p>Medical Institute Bayer (MIB) je jedna od najsavremenijih privatnih bolnica u BiH, smještena u Tuzli. Sa timom od 46+ doktora, od kojih su 40 specijalisti, MIB pruža bolničku i specijalističku skrb iz najzahtjevnijih medicinskih oblasti.</p><p>Specijalnosti: kardiologija i intervencijska kardiologija, kardiovaskularna hirurgija, ortopedija, ginekologija i akušerstvo, endokrinologija, gastroenterologija, opšta i abdominalna hirurgija, torakalna hirurgija, pedijatrijska hirurgija, te plastična i rekonstruktivna hirurgija. Hitna služba 24/7.</p>",
    address: "Alekse Šantića 8, 75000 Tuzla",
    lat: 44.5388, lng: 18.6755,
    phone: "+387 35 309 100", email: "info@mib.institute",
    status: "active", viewCount: 1560,
    _img: "https://images.pexels.com/photos/11361813/pexels-photo-11361813.jpeg?w=800",
  },
  {
    title: "Eurofarm Centar – poliklinika Tuzla",
    companyName: "Eurofarm Centar Poliklinika d.o.o. Tuzla",
    content: "<p>Eurofarm Centar Poliklinika u Tuzli je moderna privatna zdravstvena ustanova koja nudi visokokvalitetne specijalističke i dijagnostičke usluge uz primjenu savremene medicinske opreme. Poliklinika je poznata po kvalitetnom fizioterapijskom timu i rehabilitacijskim programima.</p><p>Specijalnosti: medicina rada, interna medicina, neuropsihijatrija, oftalmologija, opća i dječja i kardiovaskularna hirurgija, fizikalna medicina i rehabilitacija, te laboratorij (biohemija, hormoni, lipidni profil, tumorski markeri). Radno vrijeme: pon–pet 07:30–16:30h.</p>",
    address: "Bulevar 2. korpusa Armije RBiH 82, 75000 Tuzla",
    lat: 44.5370, lng: 18.6740,
    phone: "+387 35 416 600", email: "info@eurofarmcentar.ba",
    status: "active", viewCount: 870,
    _img: "https://images.pexels.com/photos/5146534/pexels-photo-5146534.jpeg?w=800",
  },
  {
    title: "Plava poliklinika – Tuzla",
    companyName: "PZU Plava Medical Group – Tuzla",
    content: "<p>Plava poliklinika u Tuzli je centralna lokacija Plava Medical Group mreže, s više od 40 medicinskih oblasti i timom od 200+ zaposlenika. Poliklinika je prepoznata po kompletnoj ginekološkoj i laboratorijskoj skrbi te programima liječenja neplodnosti.</p><p>Specijalnosti: interna medicina, ginekologija, urologija (laparoskopija), estetska hirurgija, centar za liječenje neplodnosti i IVF, radiologija (MRI, CT, mamografija), laboratorij, te sanitarne knjižice. Radno vrijeme: pon–sub 07–20h.</p>",
    address: "Treće Tuzlanske brigade 7, 75000 Tuzla",
    lat: 44.5355, lng: 18.6720,
    phone: "+387 35 393 111", email: "info@plavapoliklinika.ba",
    status: "active", viewCount: 1020,
    _img: "https://images.pexels.com/photos/19963293/pexels-photo-19963293.jpeg?w=800",
  },
  {
    title: "Poliklinika Medical Irac – Tuzla",
    companyName: "PZU Poliklinika Medical Irac Tuzla",
    content: "<p>Poliklinika Medical Irac je privatna specijalistička poliklinika u Tuzli koja pruža širok spektar specijalističkih i dijagnostičkih usluga u jednoj modernoj i dobro opremljenoj zdravstvenoj ustanovi.</p><p>Specijalnosti: interna medicina, medicina rada, ginekologija (uključujući 4D ultrazvuk), dermatologija, ORL, neurologija, urologija, radiologija, gastroenterologija (kolonoskopija, gastroskopija), ergometrija, Holter EKG i kompletna laboratorijska dijagnostika s analizom tumorskih markera i hormona. Radno vrijeme: pon–sub 08–16h.</p>",
    address: "Krečanska 17-19, 75000 Tuzla",
    lat: 44.5398, lng: 18.6760,
    phone: "+387 35 366 600", email: "poliklinikairac@gmail.com",
    status: "active", viewCount: 750,
    _img: "https://images.pexels.com/photos/8326553/pexels-photo-8326553.jpeg?w=800",
  },

  // ─── ZENICA (49–50) ───────────────────────────────────────────────────────
  {
    title: "Poliklinika Sunce – sa dnevnom bolnicom, Zenica",
    companyName: "Poliklinika Sunce d.o.o. Zenica",
    content: "<p>Poliklinika Sunce s dnevnom bolnicom je vodeća privatna zdravstvena ustanova u Zenici, koja uspješno djeluje već više od 20 godina. Poliklinika nudi kompletnu dijagnostiku i specijalističku skrb uz mogućnost dnevnog bolničkog liječenja.</p><p>Specijalnosti: opšta hirurgija, ortopedija, traumatologija, neurohirurgija, interna medicina, neurologija, neuropsihijatrija, ORL, ginekologija, urologija, dermatologija, radiologija (MRI, MSCT, 3D-CT, RTG, DEXA, mamografija) i laboratorij. Otvorena svaki dan 07–20h.</p>",
    address: "Štrosmajerova 11, 72000 Zenica",
    lat: 44.2019, lng: 17.9090,
    phone: "+387 32 442 560", email: "kontakt@poliklinikasunce.com",
    status: "active", viewCount: 940,
    _img: "https://images.pexels.com/photos/4492114/pexels-photo-4492114.jpeg?w=800",
  },
  {
    title: "Medicom – privatna zdravstvena ustanova Zenica",
    companyName: "PZU Medicom Zenica",
    content: "<p>Medicom je prva i jedna od najjačih privatnih zdravstvenih ustanova u Zenici, sa statusom vodećeg dijagnostičkog centra u Zeničko-dobojskom kantonu. Ustanova je smještena u centru Zenice i dostupna svim stanovnicima kantona.</p><p>Specijalnosti: dermatologija, endokrinologija, ginekologija i akušerstvo, infektologija, kardiologija, interna medicina, hirurgija, hematologija, ultrazvučna dijagnostika i kompletna laboratorijska obrada. Radno vrijeme: pon–pet 08–19:30h, sub 07–13h.</p>",
    address: "Štrosmajerova 4, 72000 Zenica",
    lat: 44.2010, lng: 17.9078,
    phone: "+387 32 462 246", email: "info@pzumedicom.ba",
    status: "active", viewCount: 810,
    _img: "https://images.pexels.com/photos/9155926/pexels-photo-9155926.jpeg?w=800",
  },
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        return reject(new Error(`HTTP ${res.statusCode} za ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      try { fs.unlinkSync(destPath); } catch {}
      reject(err);
    });
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/portal");
  console.log("Konekcija na MongoDB uspostavljena.");

  const deleted = await Post.deleteMany({});
  console.log(`Obrisano ${deleted.deletedCount} postojećih postova.`);

  console.log(`\nPreuzimanje slika i kreiranje ${klinike.length} postova...\n`);

  let uspjesno = 0, greske = 0;

  for (let i = 0; i < klinike.length; i++) {
    const { _img, ...klinika } = klinike[i];
    process.stdout.write(`[${String(i + 1).padStart(2, "0")}/${klinike.length}] ${klinika.companyName}... `);

    if (_img) {
      const filename = `klinika-${Date.now()}-${i}.jpg`;
      const destPath = path.join(UPLOADS_DIR, filename);
      try {
        await downloadFile(_img, destPath);
        klinika.imageUrl = `/uploads/${filename}`;
        process.stdout.write("slika OK, ");
        uspjesno++;
      } catch (err) {
        process.stdout.write(`slika GREŠKA (${err.message}), `);
        greske++;
      }
    }

    await Post.create(klinika);
    console.log("ubačeno.");

    // Pauza da ne preopteretimo Unsplash CDN
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n✓ Ubačeno: ${klinike.length} klinika`);
  console.log(`✓ Slike preuzete: ${uspjesno}, greške: ${greske}`);

  const gradovi = {};
  klinike.forEach(k => {
    const parts = k.address.split(",");
    const grad = parts[parts.length - 1].trim().replace(/\d{5}\s*/g, "").trim() || "Ostalo";
    gradovi[grad] = (gradovi[grad] || 0) + 1;
  });
  console.log("\nRaspored po gradovima:");
  Object.entries(gradovi).forEach(([grad, broj]) => console.log(`  ${grad}: ${broj} ustanova`));

  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
