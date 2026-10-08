import React from 'react';
import brandLogo from '../assets/logo_brand.png';
import { Check } from 'lucide-react';

const PdfHeader = ({ badgeText }) => (
  <div className="flex justify-between items-center mb-3">
    <img src={brandLogo} alt="Vanuit Ambacht" className="h-[36px] object-contain" />
    <div className="flex items-center justify-center h-[26px] px-6 mt-1 border border-[#B5AE9E] rounded-full text-[9px] font-medium tracking-[0.2em] text-[#5C5042] uppercase font-body">
      <span className="pt-[1px]">{badgeText}</span>
    </div>
  </div>
);

export const WerkorderTemplate = ({ project }) => {
  const name = project?.name || 'Buitenverblijf Douglas';
  const id = project?.id || 'OF-2026418';
  const customer = project?.customer || 'Fam. De Vries';
  const address = project?.deliveryAddress || 'Sportlaan 12\n5062 LJ Oisterwijk';
  const partner = project?.partner || 'J. van den Berg';
  const price = project?.agreedBuildPrice || '€ 26.800,00';

  return (
    <div className="flex flex-col gap-10">
      {/* PAGE 1 */}
      <div className="w-[794px] h-[1123px] bg-white p-14 relative font-body text-[#2A2925] box-border shadow-md">
        <PdfHeader badgeText="WERKORDER" />

      <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-1">
        WERKORDER WO-2026-084 · PROJECT {id}
      </div>

      <h1 className="text-[32px] font-serif font-bold text-[#2E3C27] mb-3 leading-none">
        {name} · 8,00 × 4,00 m
      </h1>

      <div className="bg-[#F5F2EB] rounded-[8px] px-8 py-3 mb-5 flex justify-between">
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">VAKSPECIALIST</div>
          <div className="font-bold text-[12.5px]">{partner}</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">SCHOUW</div>
          <div className="font-bold text-[12.5px]">15 september 2026</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">START BOUW</div>
          <div className="font-bold text-[12.5px]">13 oktober 2026</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">OPLEVERING UITERLIJK</div>
          <div className="font-bold text-[12.5px]">31 oktober 2026</div>
        </div>
      </div>

      <div className="flex gap-8 mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">BOUWLOCATIE</div>
            <div className="h-px bg-[#D6CFC2] flex-1"></div>
          </div>
          <div className="font-bold text-[13px] mb-1">{customer}</div>
          <div className="text-[13px] leading-[1.6] text-[#70624F] mb-5 whitespace-pre-line">{address}</div>

          <div className="bg-[#EBE5D8] px-5 py-4 rounded-[10px] text-[11.5px] leading-[1.5] text-[#70624F]">
            Al het klantcontact loopt via Vanuit Ambacht. Vragen van of aan de klant? Schakel met Tim of Bram: 06 82 00 80 25.
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">VERGOEDING</div>
            <div className="h-px bg-[#D6CFC2] flex-1"></div>
          </div>

          <div className="bg-[#3E4E36] rounded-[12px] p-7 text-white flex flex-col">
            <div className="flex justify-between items-center mb-4 mt-1">
              <span className="text-[12.5px] text-[#AABDA4]">Aanneemsom excl. btw</span>
              <span className="text-[12.5px] text-[#AABDA4]">{price}</span>
            </div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-[12.5px] text-[#AABDA4]">Facturatie</span>
              <span className="text-[12.5px] text-[#AABDA4]">na akkoord oplevering</span>
            </div>
            
            <div className="h-[1px] bg-white/20 w-full mb-4"></div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-[13px] text-[#F5F2EB]">Totaal excl. btw</span>
              <span className="font-serif text-[28px] text-[#F5F2EB] font-bold leading-none tracking-tight">{price}</span>
            </div>
            <div className="text-[9.5px] text-[#AABDA4] text-right leading-[1.4] mt-1">
              Meerwerk uitsluitend na schriftelijk akkoord van Vanuit Ambacht
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">UIT TE VOEREN WERK</div>
        <div className="h-px bg-[#D6CFC2] flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] leading-[1.6] text-[#70624F] pr-6">
        {[
          'Draagconstructie Douglas 15 × 15 cm, fijnbezaagd, zwart behandeld',
          'Plaatsing op betonpoeren, inclusief uitvlakken ondergrond',
          'Plat dak met EPDM, aluminium daktrim, verholen afvoer',
          'Poolhouse-gedeelte dicht: rabatdelen en dubbele deuren',
          'Loungegedeelte open en overkapt',
          'Elektrapakket: 4 spots, 2 dubbele stopcontacten, schakelaar',
          'Plafond afwerken met houten delen',
          'Volledig conform technische tekening (bijlage 1)'
        ].map((text, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="mt-[4px]"><Check size={14} strokeWidth={2.5} color="#2A2925" /></div>
            <span className="whitespace-pre-line">{text}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">BIJLAGEN</div>
          <div className="h-px bg-[#D6CFC2] flex-1"></div>
        </div>
        
        <div className="w-full">
          <div className="flex text-[9px] font-bold tracking-[0.2em] text-[#70624F] uppercase pb-2">
            <div className="w-[12%]">NR.</div>
            <div className="flex-1">DOCUMENT</div>
            <div className="w-[30%]">VERSIE</div>
          </div>
          <div className="h-px bg-[#70624F] w-full mb-1"></div>
          
          <div className="flex text-[12.5px] items-center py-2">
            <div className="w-[12%] font-bold text-[#2A2925]">1</div>
            <div className="flex-1 text-[#70624F]">Technische tekening buitenverblijf</div>
            <div className="w-[30%] text-[#70624F]">v2.1 · 8 sept 2026</div>
          </div>
          <div className="h-px bg-[#EBE5D8] w-full"></div>
          
          <div className="flex text-[12.5px] items-center py-2">
            <div className="w-[12%] font-bold text-[#2A2925]">2</div>
            <div className="flex-1 text-[#70624F]">Render / ontwerpbeeld</div>
            <div className="w-[30%] text-[#70624F]">definitief</div>
          </div>
          <div className="h-px bg-[#EBE5D8] w-full"></div>
          
          <div className="flex text-[12.5px] items-center py-[10px]">
            <div className="w-[12%] font-bold text-[#2A2925]">3</div>
            <div className="flex-1 text-[#70624F]">Schouwrapport locatie</div>
            <div className="w-[30%] text-[#70624F]">volgt na schouw</div>
          </div>
          <div className="h-px bg-[#EBE5D8] w-full"></div>
        </div>
      </div>

      <div className="absolute bottom-8 left-14 right-14">
        <div className="h-px bg-[#D6CFC2] w-full mb-4"></div>
        <div className="flex justify-between items-center text-[9.5px] font-medium text-[#70624F]">
          <span className="font-bold tracking-[0.2em] uppercase">VANUIT AMBACHT</span>
          <span>Werkorder WO-2026-084</span>
          <span>1 / 2</span>
        </div>
      </div>
    </div>

      {/* PAGE 2 */}
      <div className="w-[794px] h-[1123px] bg-white p-14 relative font-body text-[#2A2925] box-border shadow-md overflow-hidden">
        
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden z-0">
          <span className="text-[180px] font-serif font-bold text-black -rotate-45 whitespace-nowrap tracking-widest">
            VANUIT AMBACHT
          </span>
        </div>

        <div className="relative z-10">
          <PdfHeader badgeText="WERKORDER" />
          
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-1 mt-6">
            WERKAFSPRAKEN
          </div>
          <h1 className="text-[32px] font-serif font-bold text-[#2E3C27] mb-5 leading-none">
            Zo werken we samen
          </h1>

          <div className="flex flex-col gap-3 text-[12px] leading-[1.5] text-[#70624F] mb-6">
            {[
              { title: 'Klantcontact via Vanuit Ambacht.', desc: 'Tim en Bram zijn en blijven het aanspreekpunt voor de klant. Inhoudelijke vragen op locatie? Kort en vriendelijk beantwoorden mag altijd; afspraken, wijzigingen en prijzen lopen via ons.' },
              { title: 'Wijzigingen en meerwerk alleen na akkoord.', desc: 'Wil de klant iets anders dan de tekening? Niet direct toezeggen, maar melden bij Vanuit Ambacht. Wij verwerken het in een meerwerkopdracht en stemmen de prijs met de klant af.' },
              { title: 'Communicatie en voortgang.', desc: 'Projectupdates via Trello; korte vragen via WhatsApp of telefoon. Meld de start en afronding van elke bouwdag kort in het projectbord, inclusief foto\'s van de voortgang.' },
              { title: 'Kwaliteit en materiaal.', desc: 'Uitvoering conform technische tekening en de kwaliteitsstandaard van Vanuit Ambacht. Afwijkingen in materiaal of maat altijd eerst overleggen.' },
              { title: 'Nette bouwplaats.', desc: 'De bouwplaats wordt elke dag veilig en netjes achtergelaten en na oplevering volledig opgeruimd, inclusief afvoer van restmateriaal.' },
              { title: 'Oplevering samen met de klant.', desc: 'De oplevering gebeurt aan de hand van het opleverrapport van Vanuit Ambacht. Facturatie kan na akkoord van de klant op de oplevering.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-[24px] h-[24px] rounded-full bg-[#3E4E36] text-white flex items-center justify-center text-[11px] font-bold mt-[1px]">
                  {i + 1}
                </div>
                <div>
                  <span className="font-bold text-[#2A2925]">{item.title}</span> {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">CHECKLIST VÓÓR OPLEVERING</div>
            <div className="h-px bg-[#D6CFC2] flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[12px] text-[#70624F] mb-6 pr-4">
            {[
              'Constructie stabiel, waterpas en conform tekening',
              'Dak, daktrim en afvoer gecontroleerd op\nwaterdichtheid',
              'Deuren en beslag afgesteld',
              'Elektra aangesloten en getest',
              'Afwerking gecontroleerd, beschadigingen\nhersteld',
              'Bouwplaats opgeruimd, restmateriaal afgevoerd',
              "Voortgangsfoto's gedeeld in Trello",
              'Opleverrapport samen met klant ingevuld'
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-[14px] h-[14px] border-[1.5px] border-[#2A2925] rounded-[2px] shrink-0 mt-[3px]"></div>
                <span className="whitespace-pre-line leading-[1.5]">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            <div className="flex-1 bg-[#F5F2EB] rounded-[10px] p-6 pt-5">
              <div className="text-[10.5px] font-bold tracking-[0.2em] text-[#70624F] uppercase mb-8">AKKOORD - VAKSPECIALIST</div>
              
              <div className="border-b border-[#2A2925] mb-2"></div>
              <div className="text-[10px] text-[#AABDA4] mb-8">Naam</div>
              
              <div className="border-b border-[#2A2925] mb-2"></div>
              <div className="text-[10px] text-[#AABDA4]">Datum en handtekening</div>
            </div>
            <div className="flex-1 bg-[#F5F2EB] rounded-[10px] p-6 pt-5">
              <div className="text-[10.5px] font-bold tracking-[0.2em] text-[#70624F] uppercase mb-8">NAMENS VANUIT AMBACHT</div>
              
              <div className="border-b border-[#2A2925] mb-2"></div>
              <div className="text-[10px] text-[#AABDA4] mb-8">Naam</div>
              
              <div className="border-b border-[#2A2925] mb-2"></div>
              <div className="text-[10px] text-[#AABDA4]">Datum en handtekening</div>
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <div className="absolute bottom-8 left-14 right-14 z-20">
          <div className="h-px bg-[#D6CFC2] w-full mb-4"></div>
          <div className="flex justify-between items-center text-[9.5px] font-medium text-[#70624F]">
            <span className="font-bold tracking-[0.2em] uppercase">VANUIT AMBACHT</span>
            <span>Werkorder WO-2026-084</span>
            <span>2 / 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OpleverrapportTemplate = ({ project }) => {
  const name = project?.name || 'Buitenverblijf Douglas';
  const id = project?.id || 'OF-2026418';
  const customer = project?.customer || project?.customerName || 'Sander de Vries';
  const address = project?.deliveryAddress || project?.city || 'Oisterwijk';
  const partner = project?.partner || project?.partnerName || 'J. van den Berg';
  
  const shortName = (customer || 'Sander de Vries').split(' ').pop();
  const objType = (name || '').toLowerCase().includes('keuken') ? 'buitenkeuken' : 'buitenverblijf';

  return (
    <div className="w-[794px] h-[1123px] bg-white p-14 relative font-body text-[#2A2925] box-border">
      <PdfHeader badgeText="OPLEVERING" />

      <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-1">
        OPLEVERRAPPORT OP-2026-042
      </div>

      <h1 className="text-[32px] font-serif text-[#44523C] mb-4 leading-none">
        Opgeleverd. Veel plezier van je buitenverblijf,
        <br />
        Sander.
      </h1>

      <div className="bg-[#F5F2EB] rounded-[8px] px-8 py-3 mb-5 flex justify-between">
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">PROJECT</div>
          <div className="font-bold text-[12.5px]">{id}</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">OPLEVERDATUM</div>
          <div className="font-bold text-[12.5px]">28 oktober 2026</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">KLANT</div>
          <div className="font-bold text-[12.5px]">{customer}</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium tracking-[0.2em] text-[#5C5042] uppercase mb-2">LOCATIE</div>
          <div className="font-bold text-[12.5px]">{String(address || 'Oisterwijk').split(',').pop().trim().split(' ').pop()}</div>
        </div>
      </div>

      <div className="flex gap-14 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">HET PROJECT</div>
            <div className="h-px bg-[#D6CFC2] flex-1"></div>
          </div>
          <div className="font-bold text-[12.5px] text-[#2A2925] mb-1">{name} · 8,00 × 4,00 m</div>
          <div className="text-[12.5px] leading-[1.6] text-[#70624F]">
            Overkapping met dicht poolhouse-gedeelte<br/>
            Plat dak met EPDM · elektrapakket<br/>
            Gebouwd conform offerte {id}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">UITGEVOERD DOOR</div>
            <div className="h-px bg-[#D6CFC2] flex-1"></div>
          </div>
          <div className="font-bold text-[12.5px] text-[#2A2925] mb-1">Vakspecialist: {partner}</div>
          <div className="text-[12.5px] leading-[1.6] text-[#70624F]">
            In opdracht van Vanuit Ambacht<br/>
            Hoofdaanspreekpunt: Tim & Bram<br/>
            06 82 00 80 25 · info@vanuitambacht.nl
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">GECONTROLEERD BIJ OPLEVERING</div>
        <div className="h-px bg-[#D6CFC2] flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] text-[#70624F] mb-5">
        {[
          'Constructie stabiel, waterpas en conform tekening', 'Dak, daktrim en hemelwaterafvoer gecontroleerd',
          'Deuren en beslag afgesteld en soepel werkend', 'Elektra aangesloten en getest',
          'Afwerking en behandeling gecontroleerd', 'Bouwplaats opgeruimd achtergelaten',
          'Onderhoudsadvies met de klant besproken', 'Klant heeft het geheel goedgekeurd'
        ].map(item => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-[14px] h-[14px] border-[1.5px] border-[#2A2925] rounded-[2px] shrink-0"></div>
            <span className="whitespace-nowrap">{item}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="text-[11px] font-bold tracking-[0.2em] text-[#70624F] uppercase">
          RESTPUNTEN <span className="normal-case opacity-70 tracking-normal text-[10px] ml-1">(indien van toepassing)</span>
        </div>
        <div className="h-px bg-[#D6CFC2] flex-1"></div>
      </div>

      <div className="flex w-full mb-1 text-[9.5px] font-bold tracking-[0.2em] text-[#70624F] uppercase opacity-80">
        <div className="flex-[2.5]">OMSCHRIJVING</div>
        <div className="flex-1">AFGEHANDELD VÓÓR</div>
      </div>
      
      <div className="border-t border-[#2A2925] pt-1 mb-5">
        {[1, 2, 3].map(row => (
          <div key={row} className="w-full border-b border-[#EBE5D8] pb-5 mb-2"></div>
        ))}
      </div>

      <div className="bg-[#44523C] rounded-[8px] px-6 py-4 text-white mb-4 flex gap-4 items-center">
        <div className="shrink-0 opacity-90">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[26px] h-[26px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"></path>
          </svg>
        </div>
        <div>
          <div className="font-serif text-[20px] mb-1 leading-none text-[#F5F2EB]">Je garantie gaat vandaag in</div>
          <div className="text-[11px] text-[#C5D0BA] leading-[1.5]">
            Vanaf de opleverdatum geldt de garantie op de constructie. Ook daarna blijven wij je vaste<br/>
            aanspreekpunt: vragen over onderhoud of iets anders? App of bel ons gerust.
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-[#F5F2EB] border border-[#D6CFC2] rounded-[10px] p-6 pt-5">
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#70624F] uppercase mb-4">AKKOORD OPLEVERING · KLANT</div>
          <div className="font-serif text-[22px] text-[#44523C] italic mb-1 leading-none">{customer}</div>
          <div className="h-px bg-[#2A2925] opacity-80 w-full mb-1"></div>
          <div className="text-[9px] text-[#9CA996]">Naam</div>
          
          <div className="h-px bg-[#2A2925] opacity-80 w-full mb-1 mt-10"></div>
          <div className="text-[9px] text-[#9CA996]">Datum en handtekening</div>
        </div>
        
        <div className="flex-1 bg-[#F5F2EB] border border-[#D6CFC2] rounded-[10px] p-6 pt-5">
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#70624F] uppercase mb-4">NAMENS VANUIT AMBACHT</div>
          <div className="font-serif text-[22px] text-[#44523C] italic mb-1 leading-none">{partner}</div>
          <div className="h-px bg-[#2A2925] opacity-80 w-full mb-1"></div>
          <div className="text-[9px] text-[#9CA996]">Vakspecialist</div>
          
          <div className="h-px bg-[#2A2925] opacity-80 w-full mb-1 mt-10"></div>
          <div className="text-[9px] text-[#9CA996]">Datum en handtekening</div>
        </div>
      </div>

      <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center text-[10px] text-[#70624F] opacity-60">
        <span className="font-bold tracking-[0.2em] uppercase">VANUIT AMBACHT</span>
        <span className="text-center">Opleverrapport OP-2026-042 · project {id}</span>
        <span className="text-right">1 / 1</span>
      </div>
    </div>
  );
};
