const superagent = require('superagent');
const Pokemon = require('./../constructors/pokemon');
const client = require('./../data/database');

const firstHandler = (req, res) => {
	let page = generateRandomPage();
	let url = `https://api.pokemontcg.io/v2/cards?page=${page}`;
	superagent.get(url).then((results) => {
		let { data } = results.body;
		let pokemons = data
			.filter((item) => {
				return item.supertype === 'Pokémon';
			})
			.map((pokemon) => {
				return new Pokemon(pokemon);
			});

		pokemons.forEach((pokemon) => {
			let {
				name,
				description,
				level,
				hp,
				types,
				abilities,
				image,
				attacks,
				defence,
				weaknesses,
				evolvesFrom,
				evolvesTo,
			} = pokemon;

			let sql = `INSERT INTO pokemons (name, description, level, hp, type, abilities, image, attack, defence, weaknesses, evolves_from, evolves_to) 
							   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (name) DO NOTHING RETURNING *;`;
			let safeValues = [
				name,
				description,
				level,
				hp,
				types,
				abilities,
				image,
				attacks,
				defence,
				weaknesses,
				evolvesFrom,
				evolvesTo,
			];

			client
				.query(sql, safeValues)
				.then((results) => {})
				.catch((err) => {
					console.log(err);
				});
		});
		res.render('pages/login');
	});
};

function generateRandomPage() {
	return Math.floor(Math.random() * 42 + 1);
}

module.exports = firstHandler;
