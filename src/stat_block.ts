import Ability from "./ability";
import AbilityScores from "./ability_scores";
import Bonus from "./bonus";

export default interface StatBlock
{
    name?: string;
    size?: string;
    type?: string;
    subtype?: string;
    alignment?: string;
    hp?: number;
    hitDice?: string;
    ac?: number;
    acDescription?: string;
    speed?: string;
    abilityScores?: AbilityScores;
    savingThrows?: Bonus[];
    skills?: Bonus[];
    senses?: string;
    languages?: string;
    damageVulnerabilities?: string;
    damageResistances?: string;
    damageImmunities?: string;
    conditionImmunities?: string;
    cr?: string;
    crXp?: string;
    proficiencyBonus?: string;
    traits?: Ability[];
    actions?: Ability[];
    reactions?: Ability[];
    bonusActions?: Ability[];
    legendaryActions?: Ability[];
}