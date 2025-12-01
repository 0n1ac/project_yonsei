// Quick test script to see what HTML we're getting from the proxy
fetch('/api/proxy-menu')
    .then(res => res.text())
    .then(html => {
        console.log('=== HTML LENGTH ===');
        console.log(html.length);

        console.log('\n=== SEARCHING FOR TABLES ===');
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tables = doc.querySelectorAll('table');
        console.log('Found tables:', tables.length);

        console.log('\n=== SEARCHING FOR IFRAMES ===');
        const iframes = doc.querySelectorAll('iframe');
        console.log('Found iframes:', iframes.length);
        if (iframes.length > 0) {
            Array.from(iframes).forEach((iframe, i) => {
                console.log(`Iframe ${i} src:`, iframe.getAttribute('src'));
            });
        }

        console.log('\n=== SEARCHING FOR MENU-RELATED DIVS ===');
        const menuDivs = doc.querySelectorAll('[class*="menu"], [id*="menu"]');
        console.log('Found menu divs:', menuDivs.length);

        console.log('\n=== BODY TEXT (first 500 chars) ===');
        console.log(doc.body.textContent.substring(0, 500));
    });
