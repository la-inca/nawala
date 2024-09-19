const fetch = require('cross-fetch');
const cheerio = require('cheerio');

async function getOriginalUrl(shortUrl) {
  try {
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'manual',
    });

    if (response.status >= 300 && response.status < 400) {
      return response.headers.get('location');
    } else {
      console.error(`Unexpected response status for ${shortUrl}: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${shortUrl}:`, error.message);
    return null;
  }
}

function getDomain(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    console.error(`Error parsing URL ${url}:`, error.message);
    return null;
  }
}

async function getFinalUrl(originalUrl) {
  try {
    const response = await fetch(originalUrl, {
      method: 'GET',
      redirect: 'manual',
    });

    if (response.status >= 300 && response.status < 400) {
      return response.headers.get('location'); 
    } else {
      return originalUrl; 
    }
  } catch (error) {
    console.error(`Error fetching ${originalUrl}:`, error.message);
    return null;
  }
}

async function getPage(domain) {
    const url = `https://trustpositif.smbgroup.io/?domains=${domain}`;
    const controller = new AbortController(); 
    const timeoutId = setTimeout(() => controller.abort(), 120000);
  
    try {
      const response = await fetch(url, { signal: controller.signal });
      const html = await response.text();
      return html;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Request for domain ${domain} timed out`);
      } else {
        console.error(`Error fetching page for domain ${domain}:`, error.message);
      }
      return null;
    } finally {
      clearTimeout(timeoutId); 
    }
}

function parsePage(html) {
  const $ = cheerio.load(html);
  const tdValue = $('tbody tr td:nth-child(2)').text().trim(); 
  return tdValue;
}

// Fungsi untuk mengirim notifikasi LINE
function sendLineNotify(message) {
  const token = 'ZecTMejDDGhJQOK1lLfwhMbGMsqTIY7BJ7PeUlhgxBu'; 
  const url = 'https://notify-api.line.me/api/notify';

  const data = new URLSearchParams();
  data.append('message', message);

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
    body: data,
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function checkLinksAndNotify() {
  const links = [
    "https://xurl.bio/mancingduitchamp-promotion",
    "https://xurl.bio/mancingduitchamp-alternatif",
    "https://xurl.bio/mancingduitchamp-daftar",
    "https://xurl.bio/mancingduitchamp-login",
    "https://xurl.bio/latotochamp-promotion",
    "https://xurl.bio/latotochamp-alternatif",
    "https://xurl.bio/latotochamp-login",
    "https://xurl.bio/latotochamp-daftar",
    "https://xurl.bio/wdboschamp-promotion",
    "https://xurl.bio/wdboschamp-alternatif",
    "https://xurl.bio/wdboschamp-daftar",
    "https://xurl.bio/wdboschamp-login",
    "https://xurl.bio/fatcaichamp-login",
    "https://xurl.bio/fatcaichamp-daftar",
    "https://xurl.bio/fatcaichamp-alternatif",
    "https://xurl.bio/fatcaichamp-promotion",
    "https://xurl.bio/indrabetchamp-promotion",
    "https://xurl.bio/indrabetchamp-alternatif",
    "https://xurl.bio/indrabetchamp-login",
    "https://xurl.bio/indrabetchamp-daftar",
    "https://xurl.bio/depoboschamp-promotion",
    "https://xurl.bio/depoboschamp-alternatif",
    "https://xurl.bio/depoboschamp-daftar",
    "https://xurl.bio/depoboschamp-login",
    "https://xurl.bio/pulitotochamp-promotion",
    "https://xurl.bio/pulitotochamp-alternatif",
    "https://xurl.bio/pulitotochamp-daftar",
    "https://xurl.bio/pulitotochamp-login",
    "https://xurl.bio/yowestogelchamp-promotion",
    "https://xurl.bio/yowestogelchamp-alternatif",
    "https://xurl.bio/yowestogelchamp-daftar",
    "https://xurl.bio/yowestogelchamp-login",
    "https://xurl.bio/mariatogelchamp-promotion",
    "https://xurl.bio/mariatogelchamp-alternatif",
    "https://xurl.bio/mariatogelchamp-daftar",
    "https://xurl.bio/mariatogelchamp-login",
    "https://xurl.bio/pwvip4dchamp-promotion",
    "https://xurl.bio/pwvip4dchamp-alternatif",
    "https://xurl.bio/pwvip4dchamp-daftar",
    "https://xurl.bio/pwvip4dchamp-login",
    "https://xurl.bio/partaitogelchamp-promotion",
    "https://xurl.bio/partaitogelchamp-alternatif",
    "https://xurl.bio/partaitogelchamp-daftar",
    "https://xurl.bio/partaitogelchamp-login"
  ];

  for (const shortUrl of links) {
    const originalUrl = await getOriginalUrl(shortUrl);
    if (originalUrl) {
      const domain = getDomain(originalUrl);
      const lastUrl = await getFinalUrl(originalUrl);
            const lastDomain = getDomain(lastUrl);

            if (lastDomain && lastDomain !== domain) {
              sendLineNotify(`${shortUrl} = redirects from ${originalUrl} to ${lastUrl}. Someone make redirect please check manually ${lastUrl} LP or Nawala.`); 
            } 
      if (domain) {
        const html = await getPage(domain);
        if (html) {
          const tdValue = parsePage(html);
          if (tdValue == 'Ada') {
            sendLineNotify(`${shortUrl} = ${originalUrl}. Please change mota bhai dalle.`);
          }
        }
      }
    }
  }
}

checkLinksAndNotify();
