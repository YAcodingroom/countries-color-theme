'use strict'
const body = document.querySelector('body')
const header = document.querySelector('header')
const main = document.querySelector('main')
const search = document.querySelector('#search')
const cardsContainer = document.querySelector('.cards-container')
const filter = document.querySelector('.filter-switch')

let isDarkMode = false

// functions
const toThousands = function (num) {
	const numStr = num.toString()
	const newNumber = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return newNumber
}

const createTags = function (items, isBorder) {
	if (isBorder) {
		const tags = items.map((item) => {
			return `<button class="country" data-code="${item.code}">${item.name}</button>`
		})
		return tags.join('')
	}

	if (!isBorder) {
		const itemsArr = Object.values(items)
		const tags = itemsArr.map((item) => `<span>${item}</span>`)
		return tags.join(', ')
	}
	console.log(tags)
	return tags
}

const displayCountries = function (data) {
	let html = ''

	data.forEach((d) => {
		html += `
      <div class="country" data-code="${d.cioc}">
        <img class="flag" src="${d.flags.svg}" alt="flag">
        <div class="country-title">${d.name.common}</div>
        <div class="country-content">
          <p class="population">
            Population:
            <span>${toThousands(d.population)}</span>
          </p>
          <p class="region">
            Region:
            <span>${d.region}</span>
          </p>
          <p class="capital">
            Capital:
            <span>${d.capital}</span>
          </p>
        </div>
      </div>
    `
	})

	cardsContainer.innerHTML = html
}

const displayDetail = function (data, borders) {
	const currencyName = Object.keys(data.currencies)

	const html = `
    <div class="detail">
      <div class="home-btn">
        <i class="fa-solid fa-arrow-left"></i>
        <button>Back</button>
      </div>
      <div class="country-detail">
        <img class="flag" src="${data.flags.svg}" alt="flag">
        <div class="title">${data.name.common}</div>
        <div class="location">
          <p>
            Native Name:
            <span>${data.name.official}</span>
          </p>
          <p>
            Population:
            <span>${toThousands(data.population)}</span>
          </p>
          <p>
            Region:
            <span>${data.region}</span>
          </p>
          <p>
            Sub Region:
            <span>${data.subregion}</span>
          </p>
          <p>
            Capital:
            <span>${data.capital}</span>
          </p>
        </div>

        <div class="cultural">
          <p>
            Top Level Domain:
            ${createTags(data.tld, false)}
          </p>
          <p>
            Currencies:
            <span>${data.currencies[currencyName].name}</span>
          </p>
          <p>
            Languages:
            ${createTags(data.languages, false)}
          </p>
        </div>

        <div class="border-country">
          <p>Border Countries:</p>
          ${
						borders.length !== 0
							? createTags(borders, true)
							: '<span>no borders</span>'
					}
        </div>
      </div>
    </div> 
  `
	main.innerHTML = html
}

const getCountryByName = async function (country) {
	try {
		const res = await fetch(`https://restcountries.com/v3.1/name/${country}`)
		if (!res.ok) throw new Error(`Something went wrong! (${res.status})`)

		const data = await res.json()
		if (!data) throw new Error('Data is not found!')

		displayCountries(data)
	} catch (err) {
		console.error(err)
	}
}

const getCountryByCode = async function (code) {
	try {
		const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`)
		if (!res.ok) throw new Error(`Something went wrong!(${res.status})`)

		const data = await res.json()
		if (!data) throw new Error('Data is not found!')

		let borders = []
		if (data[0].borders) {
			borders = await Promise.all(
				data[0].borders.map(async function (border) {
					const res = await fetch(
						`https://restcountries.com/v3.1/alpha/${border}`
					)
					const borderData = await res.json()
					return { name: borderData[0].name.common, code: borderData[0].cioc }
				})
			)
		}

		displayDetail(data[0], borders)
	} catch (err) {
		console.error(err)
	}
}

// event handler
header.addEventListener('click', (e) => {
	const toggleBtn = e.target.closest('.mode-toggle')
	if (!toggleBtn) return

	if (!isDarkMode) body.classList.add('dark')
	if (isDarkMode) body.classList.remove('dark')

	isDarkMode = !isDarkMode
})

main.addEventListener('keydown', (e) => {
	if (e.code !== 'Enter') return

	const value = search.value
	if (!value) return

	getCountryByName(value)
	search.value = ''
})

main.addEventListener('click', (e) => {
	const country = e.target.closest('.country')
	if (!country) return

	const code = country.dataset.code
	getCountryByCode(code)
})
