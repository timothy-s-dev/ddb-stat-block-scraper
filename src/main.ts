import Parser from "./parser";
import StatBlock from "./stat_block";

const removeEmpty = (obj: any) => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
};

const parseJsonFromStatBlock = (statBlockElement: Element) => {
    const crString = Parser.parseTidbit(statBlockElement, "Challenge");
    const cr = crString?.slice(0, crString.indexOf(" ")) ?? "1/4";
    const crXp = crString?.slice(crString.indexOf(" ") + 1) ?? "25";
    const typeInfo = Parser.parseTypeInfo(statBlockElement);
    const statBlock: StatBlock = {
        name: Parser.parseName(statBlockElement),
        size: typeInfo.size,
        type: typeInfo.type,
        subtype: typeInfo.subtype,
        alignment: typeInfo.alignment,
        hp: parseInt(Parser.parseAttributeValue(statBlockElement, "Hit Points") ?? "0"),
        hitDice: Parser.parseAttributeExtra(statBlockElement, "Hit Points"),
        ac: parseInt(Parser.parseAttributeValue(statBlockElement, "Armor Class") ?? "10"),
        acDescription: Parser.parseAttributeExtra(statBlockElement, "Armor Class"),
        speed: Parser.parseAttributeValue(statBlockElement, "Speed"),
        abilityScores: {
            strength: Parser.parseAbilityScore(statBlockElement, "STR"),
            strengthMod: Parser.parseAbilityModifier(statBlockElement, "STR"),
            dexterity: Parser.parseAbilityScore(statBlockElement, "DEX"),
            dexterityMod: Parser.parseAbilityModifier(statBlockElement, "DEX"),
            constitution: Parser.parseAbilityScore(statBlockElement, "CON"),
            constitutionMod: Parser.parseAbilityModifier(statBlockElement, "CON"),
            intelligence: Parser.parseAbilityScore(statBlockElement, "INT"),
            intelligenceMod: Parser.parseAbilityModifier(statBlockElement, "INT"),
            wisdom: Parser.parseAbilityScore(statBlockElement, "WIS"),
            wisdomMod: Parser.parseAbilityModifier(statBlockElement, "WIS"),
            charisma: Parser.parseAbilityScore(statBlockElement, "CHA"),
            charismaMod: Parser.parseAbilityModifier(statBlockElement, "CHA"),
        },
        savingThrows: Parser.parseBonuses(Parser.parseTidbit(statBlockElement, "Saving Throws")),
        skills: Parser.parseBonuses(Parser.parseTidbit(statBlockElement, "Skills")),
        senses: Parser.parseTidbit(statBlockElement, "Senses"),
        languages: Parser.parseTidbit(statBlockElement, "Languages"),
        damageVulnerabilities: Parser.parseTidbit(statBlockElement, "Damage Vulnerabilities"),
        damageResistances: Parser.parseTidbit(statBlockElement, "Damage Resistances"),
        damageImmunities: Parser.parseTidbit(statBlockElement, "Damage Immunities"),
        conditionImmunities: Parser.parseTidbit(statBlockElement, "Condition Immunities"),
        cr: cr,
        crXp: crXp,
        proficiencyBonus: Parser.parseTidbit(statBlockElement, "Proficiency Bonus"),
        traits: Parser.parseAbilities(statBlockElement),
        actions: Parser.parseAbilities(statBlockElement, "Actions"),
        reactions: Parser.parseAbilities(statBlockElement, "Reactions"),
        bonusActions: Parser.parseAbilities(statBlockElement, "Bonus Actions"),
        legendaryActions: Parser.parseAbilities(statBlockElement, "Legendary Actions"),
    };
    removeEmpty(statBlock);
    return statBlock;
}

const formatLongYamlString = (str: string) => `"${str.replace(/(\r\n|\r|\n)/g, "\\n")}"`;

const buildYamlFromJson = (statBlock: StatBlock) => {
    let yamlString = "";
    if (statBlock.name) yamlString += `name: ${statBlock.name}\n`;
    if (statBlock.size) yamlString += `size: ${statBlock.size}\n`;
    if (statBlock.type) yamlString += `type: ${statBlock.type}\n`;
    if (statBlock.subtype) yamlString += `subtype: ${statBlock.subtype}\n`;
    if (statBlock.alignment) yamlString += `alignment: ${statBlock.alignment}\n`;
    if (statBlock.hp) yamlString += `hp: ${statBlock.hp}\n`;
    if (statBlock.hitDice) yamlString += `hit_dice: ${statBlock.hitDice.slice(1, statBlock.hitDice.length - 1)}\n`;
    if (statBlock.ac) yamlString += `ac: ${statBlock.ac}\n`;
    if (statBlock.acDescription) yamlString += `ac_description: ${statBlock.acDescription}\n`;
    if (statBlock.speed) yamlString += `speed: ${statBlock.speed}\n`;
    if (statBlock.abilityScores) yamlString += `stats: [${statBlock.abilityScores.strength}, ${statBlock.abilityScores.dexterity}, ${statBlock.abilityScores.constitution}, ${statBlock.abilityScores.intelligence}, ${statBlock.abilityScores.wisdom}, ${statBlock.abilityScores.charisma}]\n`;
    if (statBlock.savingThrows && statBlock.savingThrows.length > 0) {
        yamlString += `saves:\n`;
        for (const save of statBlock.savingThrows) {
            yamlString += `  - ${save.name}: ${save.modifier}\n`;
        }
    }
    if (statBlock.skills && statBlock.skills.length > 0) {
        yamlString += `skillsaves:\n`;
        for (const skill of statBlock.skills) {
            yamlString += `  - ${skill.name}: ${skill.modifier}\n`;
        }
    }
    if (statBlock.senses) yamlString += `senses: ${statBlock.senses}\n`;
    if (statBlock.languages) yamlString += `languages: ${statBlock.languages}\n`;
    if (statBlock.damageVulnerabilities) yamlString += `damage_vulnerabilities: ${statBlock.damageVulnerabilities}\n`;
    if (statBlock.damageResistances) yamlString += `damage_resistances: ${statBlock.damageResistances}\n`;
    if (statBlock.damageImmunities) yamlString += `damage_immunities: ${statBlock.damageImmunities}\n`;
    if (statBlock.conditionImmunities) yamlString += `condition_immunities: ${statBlock.conditionImmunities}\n`;
    if (statBlock.cr) yamlString += `cr: ${statBlock.cr}\n`;

    if (statBlock.traits && statBlock.traits.length > 0) {
        yamlString += `traits:\n`;
        for (const trait of statBlock.traits!) {
            yamlString += `  - name: ${trait.name}\n`
            yamlString += `    desc: ${formatLongYamlString(trait.description)}\n`
        }
    }

    if (statBlock.actions && statBlock.actions.length > 0) {
        yamlString += `actions:\n`;
        for (const action of statBlock.actions!) {
            yamlString += `  - name: ${action.name}\n`
            yamlString += `    desc: ${formatLongYamlString(action.description)}\n`
        }
    }

    if (statBlock.reactions && statBlock.reactions.length > 0) {
        yamlString += `reactions:\n`;
        for (const action of statBlock.reactions!) {
            yamlString += `  - name: ${action.name}\n`
            yamlString += `    desc: ${formatLongYamlString(action.description)}\n`
        }
    }

    if (statBlock.bonusActions && statBlock.bonusActions.length > 0) {
        yamlString += `bonus_actions:\n`;
        for (const action of statBlock.bonusActions!) {
            yamlString += `  - name: ${action.name}\n`
            yamlString += `    desc: ${formatLongYamlString(action.description)}\n`
        }
    }

    if (statBlock.legendaryActions && statBlock.legendaryActions.length > 0) {
        yamlString += `legendary_actions:\n`;
        for (const action of statBlock.legendaryActions!) {
            yamlString += `  - name: ${action.name}\n`
            yamlString += `    desc: ${formatLongYamlString(action.description)}\n`
        }
    }

    return yamlString;
}

const addButtonToStatBlock = (statBlockElement: Element) =>
{
    const yamlButton = document.createElement("button");
    yamlButton.textContent = "Copy YAML";
    yamlButton.onclick = () => {
        const json = parseJsonFromStatBlock(statBlockElement);
        const yaml = buildYamlFromJson(json);
        navigator.clipboard.writeText(yaml);
    }
    statBlockElement.parentElement!.insertBefore(yamlButton, statBlockElement.nextSibling)

    const jsonButton = document.createElement("button");
    jsonButton.textContent = "Copy JSON";
    jsonButton.onclick = () => {
        const json = parseJsonFromStatBlock(statBlockElement);
        console.log(json);
        navigator.clipboard.writeText(JSON.stringify(json));
    }
    statBlockElement.parentElement!.insertBefore(jsonButton, statBlockElement.nextSibling)
}

const statBlockClassName = "mon-stat-block";

const observer = new MutationObserver(mutations => {
    const statBlockElements: Element[] = [];
    for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType !== Node.ELEMENT_NODE) continue; // not a DOM element
            const element = addedNode as Element;
            if (element.classList.contains(statBlockClassName)) {
                statBlockElements.push(element);
            } else if (element.firstElementChild) {
                statBlockElements.push(...element.getElementsByClassName(statBlockClassName));
            }
        }
    }
    statBlockElements.forEach(addButtonToStatBlock);
});
observer.observe(document, { childList: true, subtree: true });

[...document.getElementsByClassName(statBlockClassName)].forEach(addButtonToStatBlock);