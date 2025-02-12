import "./array.ts";

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
	barrierMod?: number;
	armorMod?: number;
	dodgeMod?: number;
};

class Combatant {
	name!: string;
	stats!: Stats;
	weapon!: Weapon;
	armor!: Armor;

	hp: number;
	barrierRating: number;
	armorRating: number;
	dodgeRating: number;

	constructor(input: {
		name: string;
		stats: Stats;
		weapon: Weapon;
		armor: Armor;
	}) {
		Object.assign(this, input);

		this.hp = (this.stats.constitution * 5) || 1;
		this.barrierRating = this.stats.willpower + (this.armor.barrierMod ?? 0);
		this.armorRating = this.stats.strength + (this.armor.armorMod ?? 0);
		this.dodgeRating = this.stats.agility + (this.armor.dodgeMod ?? 0);
	}

	rest() {
		this.hp = (this.stats.constitution * 5) || 1;
		this.barrierRating = this.stats.willpower + (this.armor.barrierMod ?? 0);
		this.armorRating = this.stats.strength + (this.armor.armorMod ?? 0);
	}

	attack(target: Combatant): "died" | void {
		const roll = Math.floor(Math.random() * 20);
		if (roll < target.dodgeRating) {
			console.log(`${target.name} dodged the attack!`);
			return;
		}

		const damageType = this.weapon.damageType;
		let damage = this.weapon.damage + (damageType === "physical" ? this.stats.strength : this.stats.intellect);

		while (damage > 0) {
			if (target.hp <= 0) return "died";

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

class CombatantWithHeal extends Combatant {
	heal(targets: Combatant[]): void {
		for (const target of targets) {
			target.rest();
		}
	}
}

class CombatantWithFireball extends Combatant {
	fireball(targets: Combatant[]): Combatant[] {
		const dead: Combatant[] = [];

		for (const target of targets) {
			let damage = 3 + this.stats.intellect;

			while (damage > 0) {
				if (target.hp <= 0) {
					dead.push(target);
					break;
				}

				if (target.barrierRating > 0) {
					target.barrierRating -= 1;
					damage -= 1;
					continue;
				}

				target.hp -= 1;
				damage -= 1;
			}
		}

		return dead;
	}
}

const Liara = new Combatant({
	name: "Liara",
	stats: {
		strength: 1,
		constitution: 2,
		agility: 3,
		cunning: 3,
		intellect: 0,
		willpower: 0,
	},
	weapon: {
		name: "Longbow",
		damage: 2,
		damageType: "physical",
	},
	armor: {
		name: "Chainmail",
		armorMod: 2,
		dodgeMod: 1,
	},
});

const Mira = new CombatantWithHeal({
	name: "Mira",
	stats: {
		strength: 0,
		constitution: 3,
		agility: 2,
		cunning: 1,
		intellect: 3,
		willpower: 1,
	},
	weapon: {
		name: "Staff of Focus",
		damage: 2,
		damageType: "magical",
	},
	armor: {
		name: "Magical Robe",
		barrierMod: 3,
		dodgeMod: 1,
	},
});

const Goblin1 = new Combatant({
	name: "G0BL-1",
	stats: {
		strength: 2,
		constitution: 1,
		agility: 2,
		cunning: 1,
		intellect: 0,
		willpower: 1,
	},
	weapon: {
		name: "Shortsword",
		damage: 3,
		damageType: "physical",
	},
	armor: {
		name: "Leather Armor",
		armorMod: 2,
	},
});

const Goblin2 = new CombatantWithFireball({
	name: "G0BL-2",
	stats: {
		strength: 1,
		constitution: 2,
		agility: 3,
		cunning: 2,
		intellect: 4,
		willpower: 1,
	},
	weapon: {
		name: "Magic Staff",
		damage: 2,
		damageType: "magical",
	},
	armor: {
		name: "Robe of Power",
		barrierMod: 2,
		dodgeMod: 1,
	},
});

function findWeakestEnemy(enemies: Combatant[], attacker_damage_type: DamageType): Combatant {
	if (!enemies.length) throw new Error("No enemies alive!");

	const enemy_hps = enemies.map((enemy) =>
		enemy.hp + (attacker_damage_type === "physical" ? enemy.armorRating : enemy.barrierRating)
	);
	const index = enemy_hps.indexOf(Math.min(...enemy_hps));
	const enemy = enemies[index];
	if (!enemy) throw new Error("No enemy found!");

	return enemy;
}

function shuffleArray<T>(array: T[]): T[] {
	return array.sort(() => Math.random() - 0.5);
}

function simulateCombat({ team1, team2 }: { team1: Combatant[]; team2: Combatant[] }): void {
	const team1_snapshot = [...team1];
	const team2_snapshot = [...team2];
	let turnCount = 0;

	const randomizedTurnOrder = shuffleArray([...team1, ...team2]);
	outer: while (team1.length && team2.length) {
		turnCount++;
		if (turnCount >= 100) throw new Error("Combat not resolving!");

		for (const combatant of randomizedTurnOrder) {
			if (!team1.length || !team2.length) break outer;

			if (team1.includes(combatant)) {
				if (combatant instanceof CombatantWithHeal) {
					const allies = team1.filter((ally) => ally !== combatant);
					const ally_needs_heals = allies.find((ally) => ally.hp < ally.stats.constitution * 5 * 0.5);
					if (ally_needs_heals) {
						console.log("Healing allies!");
						combatant.heal(team1);
						continue;
					}
				}

				const target = findWeakestEnemy(team2, combatant.weapon.damageType);
				const target_died = combatant.attack(target);
				if (target_died) team2.remove(target);
			}

			if (team2.includes(combatant)) {
				if (combatant instanceof CombatantWithFireball) {
					const targets = team1.filter((ally) => ally.hp > 0);
					const dead = combatant.fireball(targets);
					for (const dead_enemy of dead) team1.remove(dead_enemy);
					continue;
				}

				const target = findWeakestEnemy(team1, combatant.weapon.damageType);
				const target_died = combatant.attack(target);
				if (target_died) team1.remove(target);
			}
		}
	}

	console.log([...team1_snapshot, ...team2_snapshot].map((x) => ({
		name: x.name,
		hp: x.hp,
		barrierRating: x.barrierRating,
		armorRating: x.armorRating,
	})));

	if (!team2.length) console.log(`Team 1 wins after ${turnCount} turns!`);
	if (!team1.length) console.log(`Team 2 wins after ${turnCount} turns!`);
}

simulateCombat({
	team1: [Liara, Mira],
	team2: [Goblin1, Goblin2],
});
