'use strict'
const body = document.querySelector('body')
const header = document.querySelector('header')
const main = document.querySelector('main')
const search = document.querySelector('#search')
const cardsContainer = document.querySelector('.cards-container')
const filter = document.querySelector('.filter-switch')
const options = document.querySelector('.region-options')

const BASE_URL = 'https://restcountries.com/v3.1'
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

	return tags
}

const displayCountries = function (data) {
	let html = ''

	data.forEach((d) => {
		html += `
      <div class="country" data-code="${d.cioc || d.cca3}">
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
      <a class="home-btn" href="./index.html">
        <i class="fa-solid fa-arrow-left"></i>
        Back
      </a>
      <div class="country-detail">
        <img class="flag" src="${data.flags.svg}" alt="flag">
        <div class="country-description">
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
              <span>${
								Array.isArray(currencyName)
									? createTags(currencyName, false)
									: data.currencies[currencyName].name
							}</span>
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
    </div> 
  `
	main.innerHTML = html
}

// get datas
const getCountryByName = async function (country) {
	try {
		const res = await fetch(`${BASE_URL}/name/${country}`)
		if (!res.ok) throw new Error(`SOMETHING WENT WRONG! (${res.status})`)

		const data = await res.json()
		if (!data) throw new Error('DATA IS NOT FOUND!')

		displayCountries(data)
	} catch (err) {
		console.error(err)
	}
}

const getCountryByCode = async function (code) {
	try {
		const res = await fetch(`${BASE_URL}/alpha/${code}`)
		if (!res.ok) throw new Error(`SOMETHING WENT WRONG! (${res.status})`)

		const data = await res.json()
		if (!data) throw new Error('DATA IS NOT FOUND!')

		let borders = []
		if (data[0].borders) {
			borders = await Promise.all(
				data[0].borders.map(async function (border) {
					try {
						const res = await fetch(`${BASE_URL}/alpha/${border}`)
						if (!res.ok)
							throw new Error(`SOMETHING WENT WRONG! (${res.status})`)

						const borderData = await res.json()
						return { name: borderData[0].name.common, code: border }
					} catch (err) {
						console.error(`FAILED TO FETCH BORDER COUNTRY ${border}:`, err)
						return { name: 'Unknown', code: border }
					}
				})
			)
		}

		displayDetail(data[0], borders)
	} catch (err) {
		console.error(err)
	}
}

const getCountryByRegion = async function (region) {
	try {
		const res = await fetch(`${BASE_URL}/region/${region}`)
		if (!res.ok) throw new Error(`SOMETHING WENT WRONG! (${res.status})`)

		const data = await res.json()
		if (!data) throw new Error('DATA IS NOT FOUND!')

		displayCountries(data)
	} catch (err) {
		console.error(err)
	}
}

const getAllCountries = async function () {
	try {
		const res = await fetch(`${BASE_URL}/all`)
		if (!res.ok) throw new Error(`SOMETHING WENT WRONG! (${res.status})`)

		const data = await res.json()
		if (!data) throw new Error('DATA IS NOT FOUND!')

		displayCountries(data)
	} catch (err) {
		console.error(err)
	}
}

// event handler
body.addEventListener('click', (e) => {
	const selector = e.target.closest('.region-selector')
	const isHidden = options.classList.contains('hidden')
	if (selector) return
	if (!isHidden) options.classList.add('hidden')
})

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

filter.addEventListener('click', (e) => {
	const selector = e.target.closest('.region-selector')
	const option = e.target.closest('.option')

	if (selector) options.classList.toggle('hidden')

	if (option) {
		const region = option.dataset.region
		options.classList.toggle('hidden')
		getCountryByRegion(region)
	}
})
getAllCountries()
