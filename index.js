const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readlineSync = require('readline-sync');

const credentialsPath = path.join(__dirname, 'credentials.json');

function ask(question) {
    return readlineSync.question(question);
}

function askPassword(question) {
    return readlineSync.question(question, { hideEchoBack: true });
}

function getCredentials() {
    let email, password;

    if (fs.existsSync(credentialsPath)) {
        const saved = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
        const change = ask('Change saved email or password? (yes/no): ');
        if (change.toLowerCase() === 'yes') {
            email = ask('Email: ');
            password = askPassword('Password: ');
            fs.writeFileSync(credentialsPath, JSON.stringify({ email, password }, null, 2));
        } else {
            email = saved.email;
            password = saved.password;
        }
    } else {
        email = ask('Email: ');
        password = askPassword('Password: ');
        fs.writeFileSync(credentialsPath, JSON.stringify({ email, password }, null, 2));
    }

    return { email, password };
}

async function SignInLinkedIn() {
    const { email, password } = getCredentials();

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    page.setDefaultTimeout(0);

    await page.goto('https://www.linkedin.com/checkpoint/lg/sign-in-another-account', {
        waitUntil: 'networkidle2',
        timeout: 0,
    });

    await page.waitForSelector('input#username');
    await page.type('input#username', email, { delay: 50 });

    await page.waitForSelector('input#password');
    await page.type('input#password', password, { delay: 50 });

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });

    console.log('Logged in successfully.');
    await page.screenshot({ path: 'linkedin_loggedin.png' });

    readlineSync.question('Press ENTER to close the browser...');
    await browser.close();
    console.log('Browser closed.');
}

SignInLinkedIn();
