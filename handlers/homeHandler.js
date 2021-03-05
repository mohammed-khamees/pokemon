const superagent = require('superagent');
const Pokemon = require('./../constructors/pokemon');
const client = require('./../data/database');

const homeHandler = (req, res) => {
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
				.then((results) => {
					// console.log(results.rows);
				})
				.catch((err) => {
					console.log(err);
				});
		});

		let sql2 =
			'SELECT * FROM pokemons WHERE level IS NOT NULL ORDER BY hp DESC LIMIT 20;';
		client.query(sql2).then((results) => {
			res.render('pages/home', { pokemons: results.rows });
		});
	});
};

function generateRandomPage() {
	return Math.floor(Math.random() * 42 + 1);
}

module.exports = homeHandler;
