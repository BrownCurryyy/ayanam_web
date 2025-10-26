const nakshatras = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
  "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
  "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati"
];

const rashis = [
  "Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrischika",
  "Dhanu","Makara","Kumbha","Meena"
];

const nakSel = document.getElementById('nakshatra');
const rashSel = document.getElementById('moonsign');
const resultDiv = document.getElementById('result');
const findBtn = document.getElementById('findBtn');

// populate dropdowns
nakshatras.forEach(n => {
  const opt = document.createElement('option');
  opt.value = n;
  opt.textContent = n;
  nakSel.appendChild(opt);
});

rashis.forEach(r => {
  const opt = document.createElement('option');
  opt.value = r;
  opt.textContent = r;
  rashSel.appendChild(opt);
});

// hide result initially
resultDiv.classList.remove('show');

// helper: parse dd/mm/yyyy properly
function parseDMY(dateStr){
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

// mapping birth month → possible lunar months (maasa)
const monthToMasas = {
  1: ["Pausha"], 
  2: ["Magha"], 
  3: ["Phalguna"], 
  4: ["Chaitra"], 
  5: ["Vaishakha"],
  6: ["Jyeshtha","Ashadha"], 
  7: ["Ashadha","Shravana"], 
  8: ["Shravana","Bhadrapada"], 
  9: ["Bhadrapada","Ashwayuja"],
  10:["Ashwayuja","Kartika"], 
  11:["Kartika","Margashira"], 
  12:["Margashira","Pausha"]
};

// main button click
findBtn.addEventListener('click', async () => {
  const birthDateStr = document.getElementById('birthDate').value;
  const nakshatra = nakSel.value.trim();
  const moonsign = rashSel.value.trim();

  if(!birthDateStr || !nakshatra || !moonsign){
    alert('Please fill all fields');
    return;
  }

  const birthDate = new Date(birthDateStr);
  const birthMonth = birthDate.getMonth() + 1;
  const targetMasas = monthToMasas[birthMonth] || [];

  try {
    const data = await fetch('panchanga_2025.json').then(r => r.json());

    // filter by nakshatra + moonsign + lunar month
    const matches = Object.entries(data).filter(([date, info]) =>
      info.Nakshatra.toLowerCase() === nakshatra.toLowerCase() &&
      info.Moonsign.toLowerCase() === moonsign.toLowerCase() &&
      targetMasas.some(m => info.Maasa.toLowerCase().includes(m.toLowerCase()))
    );

    if(matches.length === 0){
      resultDiv.innerHTML = `<p>No matches found for ${nakshatra} (${moonsign}) in the same lunar month.</p>`;
      resultDiv.classList.add('show');
      return;
    }

    // sort by truly nearest date
    matches.sort(([d1],[d2]) => {
      const date1 = parseDMY(d1);
      const date2 = parseDMY(d2);
      return Math.abs(date1 - birthDate) - Math.abs(date2 - birthDate);
    });

    const [nearestDate, info] = matches[0];

    resultDiv.innerHTML = `
      <h3>Your Nearest Match is on</h3>
      <h3>${nearestDate} → ${info.Tithi}, ${info.Nakshatra}, ${info.Moonsign}, ${info.Maasa}</h3>
    `;
    resultDiv.classList.add('show');

  } catch(err){
    console.error(err);
    resultDiv.innerHTML = `<p style="color:red;">Error loading data.</p>`;
    resultDiv.classList.add('show');
  }
});

// fade-in body after load
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
});

// mobile nav toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('show');
});
