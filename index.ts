type Stats = {
	strength: number;
	constitution: number;
	agility: number;
	cunning: number;
	intellect: number;
	willpower: number;
};

type DamageType = "physical" | "magical";

type Weapon = {
	name: string;
	damage: number;
	damageType: DamageType;
};

type Armor = {
	name: string;
	armorMod?: number;
	barrierMod?: number;
	dodgeMod?: number;
};

class Combatant {
	hp: number;
	dodgeRating: number;
	armorRating: number;
	barrierRating: number;

	constructor(
		public name: string,
		public stats: Stats,
		public weapon: Weapon,
		public armor: Armor,
	) {
		this.hp = (this.stats.constitution * 5) || 1;
		this.dodgeRating = this.stats.agility + (this.armor.dodgeMod ?? 0);
		this.armorRating = this.stats.strength + (this.armor.armorMod ?? 0);
		this.barrierRating = this.stats.willpower + (this.armor.barrierMod ?? 0);
	}

	rest() {
		this.hp = (this.stats.constitution * 5) || 1;
		this.dodgeRating = this.stats.agility + (this.armor.dodgeMod ?? 0);
		this.armorRating = this.stats.strength + (this.armor.armorMod ?? 0);
		this.barrierRating = this.stats.willpower + (this.armor.barrierMod ?? 0);
	}

	attack(target: Combatant): true | void {
		const roll = Math.floor(Math.random() * 20);
		if (roll < target.dodgeRating) {
			console.log(`${target.name} dodged the attack!`);
			return;
		}

		const damageType = this.weapon.damageType;
		let damage = this.weapon.damage + (damageType === "physical" ? this.stats.strength : this.stats.intellect);

		while (damage > 0) {
			if (target.hp <= 0) return true;

			if (damageType === "physical") {
				if (target.armorRating > 0) {
					target.armorRating -= 1;
					damage -= 1;
					continue;
				}
			}

			if (damageType === "magical") {
				if (target.barrierRating > 0) {
					target.barrierRating -= 1;
					damage -= 1;
					continue;
				}
			}

			target.hp -= 1;
			damage -= 1;
		}
	}
}

/* const Liara = new Combatant("Liara", {
	strength: 1,
	constitution: 2,
	agility: 3,
	cunning: 3,
	intellect: 0,
	willpower: 0,
}, {
	name: "Longbow",
	damage: 2,
	damageType: "physical",
}, {
	name: "Chainmail",
	armorMod: 2,
	dodgeMod: 1,
});

const gob = new Combatant("G0B-1", {
	strength: 1,
	constitution: 1,
	agility: 1,
	cunning: 1,
	intellect: 0,
	willpower: 0,
}, {
	name: "Shortsword",
	damage: 1,
	damageType: "physical",
}, {
	name: "Leather Armor",
	armorMod: 1,
});

console.log("Before fight");
console.log(`Liara has ${Liara.hp} HP and ${Liara.armorRating} AR`);
console.log(`G0B-1 has ${gob.hp} HP and ${gob.armorRating} AR`);

let turn_count = 0;
while (true) {
	turn_count++;
	if (turn_count > 100) throw new Error("Fight not resolving");

	Liara.attack(gob);
	console.log(`Turn ${turn_count}: ${gob.name} has ${gob.hp} HP and ${gob.armorRating} AR`);
	if (gob.hp <= 0) break;

	gob.attack(Liara);
	console.log(`Turn ${turn_count}: ${Liara.name} has ${Liara.hp} HP and ${Liara.armorRating} AR`);
	if (Liara.hp <= 0) break;
}

const victor = Liara.hp > 0 ? Liara : gob;
console.log(`${victor.name} wins after ${turn_count} turns!`); */

const Liara = new Combatant(
	"Liara",
	{
		strength: 1,
		constitution: 2,
		agility: 3,
		cunning: 3,
		intellect: 0,
		willpower: 0,
	},
	{
		name: "Longbow",
		damage: 2,
		damageType: "physical",
	},
	{
		name: "Chainmail",
		armorMod: 2,
		dodgeMod: 1,
	},
);

const Mira = new Combatant(
	"Mira",
	{
		strength: 0,
		constitution: 3,
		agility: 2,
		cunning: 1,
		intellect: 3,
		willpower: 1,
	},
	{
		name: "Staff of Focus",
		damage: 2,
		damageType: "magical",
	},
	{
		name: "Magical Robe",
		barrierMod: 3,
		dodgeMod: 1,
	},
);

const Goblin1 = new Combatant(
	"G0BL-1",
	{
		strength: 2,
		constitution: 1,
		agility: 2,
		cunning: 1,
		intellect: 0,
		willpower: 1,
	},
	{
		name: "Shortsword",
		damage: 3,
		damageType: "physical",
	},
	{
		name: "Leather Armor",
		armorMod: 2,
	},
);

const Goblin2 = new Combatant(
	"G0BL-2",
	{
		strength: 1,
		constitution: 2,
		agility: 3,
		cunning: 2,
		intellect: 4,
		willpower: 1,
	},
	{
		name: "Magic Staff",
		damage: 2,
		damageType: "magical",
	},
	{
		name: "Robe of Power",
		barrierMod: 2,
		dodgeMod: 1,
	},
);

function findWeakestEnemy(enemies: Combatant[], attacker_damage_type: DamageType): [Combatant, number] {
	const enemy_hps = enemies.map((enemy) =>
		enemy.hp + (attacker_damage_type === "physical" ? enemy.armorRating : enemy.barrierRating)
	);
	const index = enemy_hps.indexOf(Math.min(...enemy_hps));
	return [enemies[index]!, index];
}

function simulateCombat(team1: Combatant[], team2: Combatant[]): void {
	const team1_snapshot = [...team1];
	const team2_snapshot = [...team2];
	let turnCount = 0;

	while (team1.length > 0 && team2.length > 0) {
		turnCount++;

		// Team 1's Turn
		for (const player of team1) {
			const [target, index] = findWeakestEnemy(team2, player.weapon.damageType);
			const target_died = player.attack(target);
			if (target_died) team2.splice(index, 1);
		}

		// Team 2's Turn
		for (const enemy of team2) {
			const [target, index] = findWeakestEnemy(team1, enemy.weapon.damageType);
			const target_died = enemy.attack(target);
			if (target_died) team1.splice(index, 1);
		}
	}

	if (team1.length === 0) {
		console.log(team2_snapshot.map((x) => ({
			name: x.name,
			hp: x.hp,
			barrierRating: x.barrierRating,
			armorRating: x.armorRating,
		})));
		console.log(`Team 2 wins after ${turnCount} turns!`);
	}

	if (team2.length === 0) {
		console.log(team1_snapshot.map((x) => ({
			name: x.name,
			hp: x.hp,
			barrierRating: x.barrierRating,
			armorRating: x.armorRating,
		})));
		console.log(`Team 1 wins after ${turnCount} turns!`);
	}
}

simulateCombat([Liara, Mira], [Goblin1, Goblin2]);
