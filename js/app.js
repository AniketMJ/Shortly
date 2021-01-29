const hamburger = document.querySelector('#hamburger')
const nav = document.querySelector('#nav')
const shortLinkCards = document.querySelector('#shortLinkCards')
const form = document.querySelector('#form')
const urlShorten = document.querySelector('#urlShorten')
const shortUrlBtn = document.querySelector('#shortUrlBtn')
const errText = document.querySelector('#errText')
const localLinks = JSON.parse(localStorage.getItem('localLinks')) || []
const clrAll = document.querySelector('#clrAll')

function addErrorIndicators(errorInfo) {
    errText.innerText = errorInfo
    errText.classList.remove('hidden')
    shortUrlBtn.classList.add('mt-8')
    urlShorten.classList.add('placeholder-red', 'ring-red')
}

function removeErrorIndicators() {
    errText.classList.add('hidden')
    shortUrlBtn.classList.remove('mt-8')
    urlShorten.classList.remove('placeholder-red', 'ring-red')
}

function addCards({original_link, full_short_link}) {
    const cardContainer = document.createElement('div')
    cardContainer.classList.add('flex', 'flex-col', 'sm:flex-row', 'sm:items-center', 'sm:justify-between', 'rounded-lg', 'bg-white', 'mt-4', 'px-6', 'py-4', 'sm:py-6')
    
    const card = `
        <a
            href="${original_link}"
            target="_blank"
            class="text-veryDarkViolet sm:mr-3 sm:text-sm md:text-base"
        >
            ${original_link}
        </a>

        <hr class="mt-4 border-grayish sm:hidden" />

        <div class="text-cyan mt-4 flex-1 sm:text-right sm:mt-0 sm:text-sm md:text-base">
            <a
                id="shortUrlLink"
                href="${full_short_link}"
                target="_blank"
            >${full_short_link}</a>
        </div>
        
        </a>
        <button id="copyBtn"
            class="btn bg-cyan rounded-md mt-4 sm:mt-0 sm:ml-6 text-white font-bold sm:text-sm"
        >
            Copy
        </button>
    `

    cardContainer.innerHTML = card

    shortLinkCards.insertBefore(cardContainer, shortLinkCards.firstChild)
}

async function copyUrl(copyText) {
    try {
        await navigator.clipboard.writeText(copyText)
        console.log('URL copied to clipboard')
    } catch (err) {
        console.error('Failed to copy: ', err)
    }
}

function loaderAnimation() {
    const loader = `
        <div id="loader" class="absolute top-0 left-0 w-full h-full bg-cyan cursor-wait flex items-center justify-center">
            <div class="rect1"></div>
            <div class="rect2 ml-2"></div>
            <div class="rect3 ml-2"></div>
            <div class="rect4 ml-2"></div>
            <div class="rect5 ml-2"></div>
        </div>
    `
    shortUrlBtn.classList.contains('relative') || shortUrlBtn.classList.add('relative')
    shortUrlBtn.innerHTML += loader
}

async function shortenIt(url) {
    shortUrlBtn.disabled = true

    loaderAnimation()

    try {

        const apiBase = `https://api.shrtco.de/v2/shorten?url=${url}`
        const shortLinkData = await fetch(apiBase)
        const shortLink = await shortLinkData.json()

        if (shortLink.ok == false) throw shortLink

        const {original_link, full_short_link} = shortLink.result
        localLinks.push({original_link, full_short_link})
        localStorage.setItem('localLinks', JSON.stringify(localLinks))
        addCards(shortLink.result)


    } catch(error) {
        console.error(error.error_code, error.error)
        
        addErrorIndicators(error.error)
    }

    shortUrlBtn.disabled = false
    console.log(shortUrlBtn)
    shortUrlBtn.removeAttribute('disabled')
    document.querySelector('#loader').remove()
    clrAll.classList.contains('hidden') && clrAll.classList.remove('hidden')

}

hamburger.addEventListener('click', () => {
    nav.classList.toggle('scale-y-100')
})

if (Array.isArray(localLinks) && localLinks.length) {
    localLinks.map(link => {
        addCards(link)
    })
    clrAll.classList.remove('hidden')
} else {
    clrAll.classList.add('hidden')
}

clrAll.addEventListener('click', () => {
    if (!localStorage) return
    localStorage.clear()
    location.reload()
})

shortLinkCards.addEventListener('click', (e) => {
    if (e.target.id == 'copyBtn') {
        
        const urlText = e.target.parentNode.querySelector('#shortUrlLink').href
        copyUrl(urlText)
        e.target.disabled = true
        e.target.innerText = 'Copied!'
        e.target.classList.add('bg-darkViolet')
    
        setTimeout(() => {
            e.target.disabled = false
            e.target.innerText = 'Copy'
            e.target.classList.remove('bg-darkViolet')
        }, 3000)
    }

})


form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (!urlShorten.value == "") {
        removeErrorIndicators()
        shortenIt(urlShorten.value)

    } else {
        let errorInfo = 'Please add a link'
        addErrorIndicators(errorInfo)
    }

})